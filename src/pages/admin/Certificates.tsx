import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Upload, Search, Pencil, Trash2, Loader2 } from "lucide-react";
import { z } from "zod";

const certificateSchema = z.object({
  verification_code: z.string().trim().min(4, "Code must be at least 4 characters").max(50, "Code too long"),
  student_name: z.string().trim().min(2, "Name must be at least 2 characters").max(200, "Name too long"),
  student_email: z.string().trim().email("Invalid email format").max(255, "Email too long").optional().or(z.literal("")),
  course_title: z.string().trim().min(3, "Course title must be at least 3 characters").max(300, "Title too long"),
  issue_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  file_url: z.string().trim().url("Invalid URL format").max(500, "URL too long"),
});

interface Certificate {
  id: string;
  verification_code: string;
  student_name: string;
  student_email: string | null;
  course_title: string;
  issue_date: string;
  file_url: string;
  status: string;
  notes: string | null;
}

export default function AdminCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCode, setSearchCode] = useState("");
  const [editingCert, setEditingCert] = useState<Certificate | null>(null);
  const [deletingCertId, setDeletingCertId] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    const { data, error } = await supabase
      .from("certificates")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load certificates",
        variant: "destructive",
      });
    } else {
      setCertificates(data || []);
    }
    setLoading(false);
  };

  const handleAddCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const rawData = {
      verification_code: formData.get("code") as string,
      student_name: formData.get("name") as string,
      student_email: formData.get("email") as string,
      course_title: formData.get("course") as string,
      issue_date: formData.get("date") as string,
      file_url: formData.get("fileUrl") as string,
    };

    const validation = certificateSchema.safeParse(rawData);

    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast({
        title: "Validation Error",
        description: firstError.message,
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("certificates").insert({
      verification_code: validation.data.verification_code,
      student_name: validation.data.student_name,
      course_title: validation.data.course_title,
      issue_date: validation.data.issue_date,
      file_url: validation.data.file_url,
      student_email: validation.data.student_email || null,
      status: "valid" as const,
      notes: null,
    } as any);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Certificate added successfully",
      });
      form.reset();
      loadCertificates();
    }
  };

  const handleEditCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCert) return;

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const rawData = {
      verification_code: formData.get("code") as string,
      student_name: formData.get("name") as string,
      student_email: formData.get("email") as string,
      course_title: formData.get("course") as string,
      issue_date: formData.get("date") as string,
      file_url: formData.get("fileUrl") as string,
    };

    const validation = certificateSchema.safeParse(rawData);

    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast({
        title: "Validation Error",
        description: firstError.message,
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("certificates")
      .update({
        verification_code: validation.data.verification_code,
        student_name: validation.data.student_name,
        course_title: validation.data.course_title,
        issue_date: validation.data.issue_date,
        file_url: validation.data.file_url,
        student_email: validation.data.student_email || null,
      })
      .eq("id", editingCert.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Certificate updated successfully",
      });
      setIsEditDialogOpen(false);
      setEditingCert(null);
      loadCertificates();
    }
  };

  const handleDeleteCertificate = async () => {
    if (!deletingCertId) return;

    const { error } = await supabase
      .from("certificates")
      .delete()
      .eq("id", deletingCertId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Certificate deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setDeletingCertId(null);
      loadCertificates();
    }
  };

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split("\n").slice(1); // Skip header

      const validCertificates: any[] = [];
      const errors: string[] = [];

      lines
        .filter((line) => line.trim())
        .forEach((line, index) => {
          const [code, name, course, date, fileUrl, email, status, notes] = line.split(",");
          
          const rawData = {
            verification_code: code?.trim() || "",
            student_name: name?.trim() || "",
            student_email: email?.trim() || "",
            course_title: course?.trim() || "",
            issue_date: date?.trim() || "",
            file_url: fileUrl?.trim() || "",
          };

          const validation = certificateSchema.safeParse(rawData);

          if (!validation.success) {
            const errorMsg = validation.error.errors[0].message;
            errors.push(`Row ${index + 2}: ${errorMsg}`);
          } else {
            validCertificates.push({
              ...validation.data,
              student_email: validation.data.student_email || null,
              status: status?.trim() || "valid",
              notes: notes?.trim() || null,
            });
          }
        });

      if (errors.length > 0) {
        toast({
          title: "Validation Errors",
          description: `${errors.length} row(s) failed. First error: ${errors[0]}`,
          variant: "destructive",
        });
        return;
      }

      if (validCertificates.length === 0) {
        toast({
          title: "No Data",
          description: "No valid certificates to import",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("certificates").insert(validCertificates as any);

      if (error) {
        toast({
          title: "Import Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `Imported ${validCertificates.length} certificates`,
        });
        loadCertificates();
      }
    };

    reader.readAsText(file);
  };

  const filteredCertificates = certificates.filter((cert) =>
    cert.verification_code.toLowerCase().includes(searchCode.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Certificates</h1>
          <p className="text-muted-foreground">Manage and verify certificates</p>
        </div>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">All Certificates</TabsTrigger>
          <TabsTrigger value="add">Add Single</TabsTrigger>
          <TabsTrigger value="import">CSV Import</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by verification code..."
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCertificates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No certificates found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCertificates.map((cert) => (
                        <TableRow key={cert.id}>
                          <TableCell className="font-mono text-sm">{cert.verification_code}</TableCell>
                          <TableCell>{cert.student_name}</TableCell>
                          <TableCell>{cert.course_title}</TableCell>
                          <TableCell>{new Date(cert.issue_date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge variant={cert.status === "valid" ? "default" : "destructive"}>
                              {cert.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingCert(cert);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setDeletingCertId(cert.id);
                                  setIsDeleteDialogOpen(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add Single Certificate</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddCertificate} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Verification Code *</Label>
                    <Input id="code" name="code" placeholder="IRTIQA-2024-001" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Student Name *</Label>
                    <Input id="name" name="name" placeholder="John Doe" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="course">Course Title *</Label>
                    <Input id="course" name="course" placeholder="15-Day Series" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Issue Date *</Label>
                    <Input id="date" name="date" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Student Email</Label>
                    <Input id="email" name="email" type="email" placeholder="student@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fileUrl">Certificate File URL *</Label>
                    <Input id="fileUrl" name="fileUrl" placeholder="https://..." required />
                  </div>
                </div>
                <Button type="submit">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Certificate
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import">
          <Card>
            <CardHeader>
              <CardTitle>CSV Bulk Import</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>CSV Format</Label>
                <div className="bg-secondary p-4 rounded-lg text-sm font-mono overflow-x-auto">
                  verification_code,student_name,course_title,issue_date,file_url,student_email,status,notes
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="csv">Upload CSV File</Label>
                <Input
                  id="csv"
                  type="file"
                  accept=".csv"
                  onChange={handleCSVImport}
                />
              </div>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import Certificates
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Certificate</DialogTitle>
            <DialogDescription>
              Update certificate information
            </DialogDescription>
          </DialogHeader>
          {editingCert && (
            <form onSubmit={handleEditCertificate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-code">Verification Code *</Label>
                  <Input
                    id="edit-code"
                    name="code"
                    defaultValue={editingCert.verification_code}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Student Name *</Label>
                  <Input
                    id="edit-name"
                    name="name"
                    defaultValue={editingCert.student_name}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-course">Course Title *</Label>
                  <Input
                    id="edit-course"
                    name="course"
                    defaultValue={editingCert.course_title}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-date">Issue Date *</Label>
                  <Input
                    id="edit-date"
                    name="date"
                    type="date"
                    defaultValue={editingCert.issue_date}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Student Email</Label>
                  <Input
                    id="edit-email"
                    name="email"
                    type="email"
                    defaultValue={editingCert.student_email || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-fileUrl">Certificate File URL *</Label>
                  <Input
                    id="edit-fileUrl"
                    name="fileUrl"
                    defaultValue={editingCert.file_url}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the certificate from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCertificate} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
