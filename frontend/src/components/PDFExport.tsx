import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ClaimVerification {
    claim: {
        text: string;
        type: string;
        startIndex: number;
        endIndex: number;
    };
    evidence?: Array<{
        url: string;
        title: string;
        snippet: string;
        score: number;
    }>;
    entailment: {
        verdict: 'entailment' | 'contradiction' | 'neutral' | 'verifying';
        confidence: number;
        reasoning: string;
    };
}

interface PDFExportProps {
    originalText: string;
    trustScore: number;
    claims: ClaimVerification[];
    summary: {
        totalClaims: number;
        verified: number;
        contradicted: number;
        unverified: number;
    };
    processingTime: number;
}

export default function PDFExport({ originalText, trustScore, claims, summary, processingTime }: PDFExportProps) {
    const generatePDF = () => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        let yPosition = 20;

        // Header - TruthLens Branding
        doc.setFontSize(24);
        doc.setTextColor(14, 165, 233); // Primary blue
        doc.text('TruthLens', pageWidth / 2, yPosition, { align: 'center' });

        yPosition += 8;
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('AI Hallucination Detection Report', pageWidth / 2, yPosition, { align: 'center' });

        yPosition += 15;

        // Report Info
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        const timestamp = new Date().toLocaleString();
        doc.text(`Generated: ${timestamp}`, 14, yPosition);
        doc.text(`Processing Time: ${processingTime}ms`, pageWidth - 14, yPosition, { align: 'right' });

        yPosition += 10;

        // Divider
        doc.setDrawColor(200, 200, 200);
        doc.line(14, yPosition, pageWidth - 14, yPosition);
        yPosition += 10;

        // Trust Score Section
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Trust Score', 14, yPosition);

        yPosition += 8;
        doc.setFontSize(36);
        const scoreColor = trustScore >= 80 ? [16, 185, 129] : trustScore >= 50 ? [245, 158, 11] : [239, 68, 68];
        doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
        doc.text(trustScore.toString(), 14, yPosition);

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        const scoreLabel = trustScore >= 80 ? 'High Trust' : trustScore >= 50 ? 'Medium Trust' : 'Low Trust';
        doc.text(scoreLabel, 30, yPosition);

        yPosition += 10;

        // Summary Statistics
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text('Summary Statistics', 14, yPosition);
        yPosition += 8;

        const summaryData = [
            ['Total Claims', summary.totalClaims.toString()],
            ['Verified', summary.verified.toString()],
            ['Contradicted', summary.contradicted.toString()],
            ['Unverified', summary.unverified.toString()]
        ];

        autoTable(doc, {
            startY: yPosition,
            head: [['Metric', 'Count']],
            body: summaryData,
            theme: 'grid',
            headStyles: { fillColor: [14, 165, 233] },
            margin: { left: 14, right: 14 },
            styles: { fontSize: 10 }
        });

        yPosition = (doc as any).lastAutoTable.finalY + 10;

        // Original Text
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text('Original Text', 14, yPosition);
        yPosition += 6;

        doc.setFontSize(9);
        doc.setTextColor(60, 60, 60);
        const textLines = doc.splitTextToSize(originalText, pageWidth - 28);
        doc.text(textLines, 14, yPosition);
        yPosition += (textLines.length * 4) + 10;

        // Check if we need a new page
        if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
        }

        // Detailed Claim Analysis
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Detailed Claim Analysis', 14, yPosition);
        yPosition += 10;

        // Contradicted Claims
        const contradictedClaims = claims.filter(c => c.entailment.verdict === 'contradiction');
        if (contradictedClaims.length > 0) {
            doc.setFontSize(12);
            doc.setTextColor(239, 68, 68);
            doc.text(`✕ Contradicted Claims (${contradictedClaims.length})`, 14, yPosition);
            yPosition += 6;

            contradictedClaims.forEach((claim, idx) => {
                if (yPosition > 270) {
                    doc.addPage();
                    yPosition = 20;
                }

                doc.setFontSize(10);
                doc.setTextColor(0, 0, 0);
                doc.text(`${idx + 1}. "${claim.claim.text}"`, 18, yPosition);
                yPosition += 5;

                doc.setFontSize(9);
                doc.setTextColor(100, 100, 100);
                const reasoningLines = doc.splitTextToSize(`Reasoning: ${claim.entailment.reasoning}`, pageWidth - 32);
                doc.text(reasoningLines, 22, yPosition);
                yPosition += (reasoningLines.length * 4) + 2;

                doc.text(`Confidence: ${Math.round(claim.entailment.confidence * 100)}%`, 22, yPosition);
                yPosition += 4;

                if (claim.evidence && claim.evidence.length > 0) {
                    doc.text(`Sources (${claim.evidence.length}):`, 22, yPosition);
                    yPosition += 4;

                    claim.evidence.slice(0, 3).forEach((source) => {
                        doc.setTextColor(14, 165, 233);
                        const sourceLines = doc.splitTextToSize(`• ${source.title}`, pageWidth - 36);
                        doc.text(sourceLines, 26, yPosition);
                        yPosition += (sourceLines.length * 4);
                    });
                }

                yPosition += 6;
            });
        }

        // Unverified Claims
        const unverifiedClaims = claims.filter(c => c.entailment.verdict === 'neutral' || c.entailment.verdict === 'verifying');
        if (unverifiedClaims.length > 0) {
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }

            doc.setFontSize(12);
            doc.setTextColor(245, 158, 11);
            doc.text(`⚠ Unverified Claims (${unverifiedClaims.length})`, 14, yPosition);
            yPosition += 6;

            unverifiedClaims.forEach((claim, idx) => {
                if (yPosition > 270) {
                    doc.addPage();
                    yPosition = 20;
                }

                doc.setFontSize(10);
                doc.setTextColor(0, 0, 0);
                const claimLines = doc.splitTextToSize(`${idx + 1}. "${claim.claim.text}"`, pageWidth - 32);
                doc.text(claimLines, 18, yPosition);
                yPosition += (claimLines.length * 4) + 6;
            });
        }

        // Verified Claims
        const verifiedClaims = claims.filter(c => c.entailment.verdict === 'entailment');
        if (verifiedClaims.length > 0) {
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }

            doc.setFontSize(12);
            doc.setTextColor(16, 185, 129);
            doc.text(`✓ Verified Claims (${verifiedClaims.length})`, 14, yPosition);
            yPosition += 6;

            verifiedClaims.forEach((claim, idx) => {
                if (yPosition > 270) {
                    doc.addPage();
                    yPosition = 20;
                }

                doc.setFontSize(10);
                doc.setTextColor(0, 0, 0);
                const claimLines = doc.splitTextToSize(`${idx + 1}. "${claim.claim.text}"`, pageWidth - 32);
                doc.text(claimLines, 18, yPosition);
                yPosition += (claimLines.length * 4) + 6;
            });
        }

        // Footer
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(
                `TruthLens Report - Page ${i} of ${pageCount}`,
                pageWidth / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            );
        }

        // Save PDF
        const filename = `truthlens-report-${Date.now()}.pdf`;
        doc.save(filename);
    };

    return (
        <button
            onClick={generatePDF}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all hover:scale-105 shadow-lg"
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="font-medium">Download PDF Report</span>
        </button>
    );
}
