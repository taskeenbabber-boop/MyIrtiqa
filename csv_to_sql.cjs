const fs = require('fs');
const path = require('path');
const readline = require('readline');

async function processCSV() {
    const csvPath = path.join(__dirname, 'certificates_rows.csv');
    const fileStream = fs.createReadStream(csvPath);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let isFirstLine = true;

    // Find the latest migration file
    const migrationsDir = path.join(__dirname, 'supabase', 'migrations');
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('_seed_certificates_data.sql')).sort();

    if (files.length === 0) {
        console.error("Migration file not found!");
        process.exit(1);
    }

    const migrationFile = path.join(migrationsDir, files[files.length - 1]);
    console.log("Writing to:", migrationFile);

    const outStream = fs.createWriteStream(migrationFile, { flags: 'a' });

    outStream.write('-- Seed certificates data from CSV\n');
    outStream.write('INSERT INTO public.certificates (id, verification_code, student_name, course_title, issue_date, file_url, status, student_email, notes, created_at, updated_at)\nVALUES\n');

    let isFirstValueLine = true;

    for await (const line of rl) {
        if (isFirstLine) {
            isFirstLine = false; // Skip header
            continue;
        }

        // Extremely naive CSV parser (handles simple cases, but this CSV has simple fields without inner commas for the most part)
        // Let's use a better regex pattern to handle optional quotes
        // Actually, looking at the data, it's mostly plain text without commas. 
        // e.g. 006c251a-0e64-40e0-804b-2a98e907f971,L74W84,Aliza Khalid,Roots of Research 15-Day Series,2025-08-05,https://drive.google.com/file/d/1w5WU8r_1TcHjMcrEKxqlFG5PpRW4knxI/preview,valid,alizakhalid1522@gmail.com,,2025-10-02 20:16:55.197003+00,2025-10-02 20:16:55.197003+00

        const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        if (parts.length < 11) continue;

        const id = parts[0].replace(/^"|"$/g, '').trim();
        const verification_code = parts[1].replace(/^"|"$/g, '').trim();
        const student_name = parts[2].replace(/^"|"$/g, '').trim().replace(/'/g, "''");
        const course_title = parts[3].replace(/^"|"$/g, '').trim().replace(/'/g, "''");
        let issue_date = parts[4].replace(/^"|"$/g, '').trim();
        const file_url = parts[5].replace(/^"|"$/g, '').trim().replace(/'/g, "''");
        const status = parts[6].replace(/^"|"$/g, '').trim();
        const student_email = parts[7].replace(/^"|"$/g, '').trim().replace(/'/g, "''");
        const notes = parts[8].replace(/^"|"$/g, '').trim().replace(/'/g, "''");
        let created_at = parts[9].replace(/^"|"$/g, '').trim();
        let updated_at = parts[10].replace(/^"|"$/g, '').trim();

        if (!created_at) created_at = new Date().toISOString();
        if (!updated_at) updated_at = new Date().toISOString();

        if (!isFirstValueLine) {
            outStream.write(',\n');
        }
        isFirstValueLine = false;

        outStream.write(`('${id}', '${verification_code}', '${student_name}', '${course_title}', '${issue_date}', '${file_url}', '${status}', '${student_email}', '${notes}', '${created_at}', '${updated_at}')`);
    }

    outStream.write('\nON CONFLICT (verification_code) DO NOTHING;\n');
    outStream.end();
    console.log("Done generating SQL!");
}

processCSV().catch(console.error);
