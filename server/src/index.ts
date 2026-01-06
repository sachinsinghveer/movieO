import fs from 'fs';
import path from 'path';

export default {
  register() { },

  async bootstrap({ strapi }) {
    console.log('----------------------------------------------------');
    console.log('BOOTSTRAP: EXECUTING FINAL PURGE AND SEED');
    console.log('----------------------------------------------------');

    try {
      const seedFilePath = path.join(process.cwd(), 'src', 'seed-data.json');
      if (!fs.existsSync(seedFilePath)) {
        console.error('BOOTSTRAP ERROR: Seed file not found at:', seedFilePath);
        return;
      }

      const movieService = strapi.documents('api::movie.movie');

      // 1. PURGE ALL (Draft & Published)
      console.log('BOOTSTRAP: Purging all existing documents...');
      const drafts = await movieService.findMany({ status: 'draft' });
      const published = await movieService.findMany({ status: 'published' });
      const allDocs = [...drafts, ...published];

      console.log(`BOOTSTRAP: Found ${allDocs.length} documents to delete.`);
      for (const doc of allDocs) {
        try {
          await movieService.delete({ documentId: doc.documentId });
          console.log(`BOOTSTRAP: Deleted ${doc.Title} (${doc.documentId})`);
        } catch (delErr) {
          // Ignore errors if document was already deleted in previous iteration
        }
      }

      // 2. SEED FRESH
      const seedData = JSON.parse(fs.readFileSync(seedFilePath, 'utf8'));
      console.log(`BOOTSTRAP: Seeding ${seedData.length} movies...`);

      for (const rawData of seedData) {
        // Data cleaning
        const data = {
          ...rawData,
          Title: String(rawData.Title).trim().replace(/^"|"$/g, ''),
          m_id: String(rawData.m_id).trim().replace(/^"|"$/g, ''),
        };

        console.log(`BOOTSTRAP: Creating & Publishing [${data.Title}]`);
        await movieService.create({
          data: {
            ...data,
            status: 'published', // Strapi 5 way to create in published state
          }
        });
      }

      console.log('----------------------------------------------------');
      console.log('BOOTSTRAP: SUCCESSFUL FRESH IMPORT');
      console.log('----------------------------------------------------');
    } catch (error: any) {
      console.error('BOOTSTRAP CRITICAL ERROR:', error.message);
      console.error(error.stack);
    }
  },
};
