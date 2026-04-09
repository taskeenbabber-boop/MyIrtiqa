import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Save, X, Plus, MoveUp, MoveDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface TeamProfile {
  id: string;
  name: string;
  role: string;
  bio: string;
  email: string;
  linkedin_url: string;
  image_url: string;
  featured: boolean;
  order_index: number;
}

const AdminTeam = () => {
  const [teamMembers, setTeamMembers] = useState<TeamProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editForm, setEditForm] = useState<Partial<TeamProfile>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any).from("team_profiles").select("*").order("order_index", { ascending: true });
    if (error) {
      toast({ title: "Error", description: "Failed to load team members", variant: "destructive" });
    } else {
      setTeamMembers(data || []);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!editingId || !editForm) return;
    const { error } = await (supabase as any).from("team_profiles").update(editForm).eq("id", editingId);
    if (error) {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Updated successfully" });
      setEditingId(null);
      fetchTeamMembers();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this member?")) return;
    const { error } = await (supabase as any).from("team_profiles").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Deleted successfully" });
      fetchTeamMembers();
    }
  };

  const handleAdd = async () => {
    const { error } = await (supabase as any).from("team_profiles").insert([{ ...editForm, order_index: teamMembers.length + 1 }]);
    if (error) {
      toast({ title: "Error", description: "Failed to add", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Added successfully" });
      setShowAddDialog(false);
      setEditForm({});
      fetchTeamMembers();
    }
  };

  const handleReorder = async (id: string, direction: "up" | "down") => {
    const idx = teamMembers.findIndex(m => m.id === id);
    if ((direction === "up" && idx === 0) || (direction === "down" && idx === teamMembers.length - 1)) return;
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    const reordered = [...teamMembers];
    const [moved] = reordered.splice(idx, 1);
    reordered.splice(newIdx, 0, moved);
    await Promise.all(reordered.map((m, i) => (supabase as any).from("team_profiles").update({ order_index: i + 1 }).eq("id", m.id)));
    fetchTeamMembers();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Team Management</h1>
        <Button onClick={() => setShowAddDialog(true)}><Plus className="w-4 h-4 mr-2" />Add Member</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Order</TableHead>
              <TableHead className="w-24">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead className="w-48">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamMembers.map((m, i) => (
              <TableRow key={m.id}>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleReorder(m.id, "up")} disabled={i === 0}><MoveUp className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleReorder(m.id, "down")} disabled={i === teamMembers.length - 1}><MoveDown className="w-4 h-4" /></Button>
                  </div>
                </TableCell>
                <TableCell><img src={m.image_url} alt={m.name} className="w-12 h-12 rounded-full object-cover" /></TableCell>
                <TableCell className="font-medium">{m.name}</TableCell>
                <TableCell>{m.role}</TableCell>
                <TableCell><span className={`px-2 py-1 rounded text-xs ${m.featured ? 'bg-primary/20 text-primary' : 'bg-muted'}`}>{m.featured ? 'Yes' : 'No'}</span></TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingId(m.id); setEditForm(m); }}>Edit</Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(m.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={!!editingId} onOpenChange={() => { setEditingId(null); setEditForm({}); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Edit Team Member</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input value={editForm.name || ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></div>
            <div><Label>Role</Label><Input value={editForm.role || ""} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} /></div>
            <div><Label>Bio</Label><Textarea value={editForm.bio || ""} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} rows={4} /></div>
            <div><Label>Email</Label><Input value={editForm.email || ""} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} /></div>
            <div><Label>LinkedIn URL</Label><Input value={editForm.linkedin_url || ""} onChange={(e) => setEditForm({ ...editForm, linkedin_url: e.target.value })} /></div>
            <div><Label>Image URL</Label><Input value={editForm.image_url || ""} onChange={(e) => setEditForm({ ...editForm, image_url: e.target.value })} /></div>
            <div className="flex items-center gap-2"><Switch checked={editForm.featured || false} onCheckedChange={(c) => setEditForm({ ...editForm, featured: c })} /><Label>Featured on Homepage</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditingId(null); setEditForm({}); }}><X className="w-4 h-4 mr-2" />Cancel</Button>
            <Button onClick={handleSave}><Save className="w-4 h-4 mr-2" />Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Add Team Member</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Name</Label><Input onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></div>
            <div><Label>Role</Label><Input onChange={(e) => setEditForm({ ...editForm, role: e.target.value })} /></div>
            <div><Label>Bio</Label><Textarea onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} rows={4} /></div>
            <div><Label>Email</Label><Input onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} /></div>
            <div><Label>LinkedIn</Label><Input onChange={(e) => setEditForm({ ...editForm, linkedin_url: e.target.value })} /></div>
            <div><Label>Image URL</Label><Input onChange={(e) => setEditForm({ ...editForm, image_url: e.target.value })} /></div>
            <div className="flex gap-2"><Switch onCheckedChange={(c) => setEditForm({ ...editForm, featured: c })} /><Label>Featured</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAdd}><Plus className="w-4 h-4 mr-2" />Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTeam;
