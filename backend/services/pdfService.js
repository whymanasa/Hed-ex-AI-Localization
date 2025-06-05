import { DocumentAnalysisClient, AzureKeyCredential } from "@azure/ai-form-recognizer";
import dotenv from 'dotenv';

dotenv.config();

class PDFService {
    constructor() {
        this.endpoint = process.env.AZURE_FORM_RECOGNIZER_ENDPOINT;
        this.key = process.env.AZURE_FORM_RECOGNIZER_KEY;
        
        if (!this.endpoint || !this.key) {
            throw new Error("Azure Form Recognizer credentials not found in environment variables");
        }

        this.client = new DocumentAnalysisClient(
            this.endpoint,
            new AzureKeyCredential(this.key)
        );
    }

    async extractTextFromPDF(pdfBuffer) {
        try {
            console.log('Starting PDF analysis...');
            
            // Start the analysis
            const poller = await this.client.beginAnalyzeDocument(
                "prebuilt-document", // Use the prebuilt document model
                pdfBuffer
            );

            // Wait for the analysis to complete
            const result = await poller.pollUntilDone();
            console.log('PDF analysis completed');

            // Extract text from all pages
            let fullText = '';
            for (const page of result.pages) {
                for (const line of page.lines) {
                    fullText += line.content + '\n';
                }
                fullText += '\n'; // Add extra newline between pages
            }

            return fullText;
        } catch (error) {
            console.error('Error processing PDF:', error);
            throw new Error(`Failed to process PDF: ${error.message}`);
        }
    }
}

export default new PDFService();