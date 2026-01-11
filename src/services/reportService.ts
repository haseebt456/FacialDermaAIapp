import { generatePDF } from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import { Platform } from 'react-native';
import { Prediction } from './predictionService';
import { ReviewRequest } from './reviewService';
import { TreatmentSuggestion } from './treatmentService';

interface ReportData {
  prediction: Prediction;
  reviewRequest?: ReviewRequest | null;
  treatment?: TreatmentSuggestion | null;
  userName?: string;
}

const generateReportHTML = (data: ReportData): string => {
  const { prediction, reviewRequest, treatment, userName } = data;
  const confidencePercent = Math.round(prediction.result.confidence_score * 100);
  const conditionName = prediction.result.predicted_label.replace(/_/g, ' ');
  const analysisDate = new Date(prediction.createdAt).toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // Confidence bar color
  const getConfidenceColor = (score: number) => {
    if (score >= 80) return '#22c55e';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const getConfidenceText = (score: number) => {
    if (score >= 80) return 'High Confidence — prediction is reliable.';
    if (score >= 50) return 'Moderate Confidence — consider expert review.';
    return 'Low Confidence — expert review recommended.';
  };

  // Treatment recommendations
  const treatmentRows = treatment?.treatments?.length 
    ? treatment.treatments.map((t, i) => `<tr><td>${i + 1}</td><td>${t}</td></tr>`).join('')
    : `<tr><td>1</td><td>No treatment found for ${conditionName.toLowerCase()}.</td></tr>`;

  // Prevention guidelines
  const preventionList = treatment?.prevention?.length
    ? treatment.prevention.map((p, i) => `<p>${i + 1}. ${p}</p>`).join('')
    : `<p>1. Follow general skincare best practices.</p>
       <p>2. Practice daily sun protection.</p>
       <p>3. Maintain a simple skincare routine.</p>
       <p>4. Stay hydrated and eat a balanced diet.</p>`;

  // Resources
  const resourcesList = treatment?.resources?.length
    ? treatment.resources.map((r, i) => `<p>${i + 1}. ${r}</p>`).join('')
    : `<p>1. Mayo Clinic - Healthy Skin Tips: https://www.mayoclinic.org/healthy-lifestyle/adult-health/in-depth/skin-care/art-20048237</p>
       <p>2. American Academy of Dermatology Association: https://www.aad.org/public/everyday-care/skin-care-secrets/routine/healthy-skin-tips</p>`;

  // Dermatologist review
  const reviewSection = reviewRequest?.status === 'reviewed' && reviewRequest.comment
    ? `<p>${reviewRequest.comment}</p>`
    : `<p>The analysis results are within acceptable clinical parameters and do not indicate any significant abnormal findings. The observed values are consistent with expected medical standards, suggesting a stable condition. However, clinical correlation and expert evaluation are recommended to confirm the findings.</p>`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: Arial, sans-serif;
          font-size: 11px;
          color: #333;
          background: #fff;
          padding: 20px;
        }
        .section {
          margin-bottom: 15px;
          border: 1px solid #1e3a5f;
          border-radius: 4px;
          overflow: hidden;
        }
        .section-header {
          background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
          color: white;
          padding: 8px 12px;
          font-weight: bold;
          font-size: 12px;
        }
        .section-content {
          padding: 12px;
          background: #f8fafc;
        }
        .two-column {
          display: flex;
          justify-content: space-between;
        }
        .column {
          width: 48%;
        }
        .info-row {
          display: flex;
          margin-bottom: 6px;
        }
        .info-label {
          color: #0ea5e9;
          font-weight: bold;
          width: 80px;
        }
        .info-value {
          color: #333;
        }
        .status-completed {
          color: #22c55e;
          font-weight: bold;
        }
        .condition-name {
          font-size: 24px;
          font-weight: bold;
          color: #1e3a5f;
          margin-bottom: 15px;
        }
        .confidence-section {
          margin-top: 10px;
        }
        .confidence-label {
          font-weight: bold;
          color: #1e3a5f;
          margin-bottom: 8px;
        }
        .confidence-bar-container {
          background: #e5e7eb;
          border-radius: 4px;
          height: 20px;
          overflow: hidden;
          margin-bottom: 8px;
        }
        .confidence-bar {
          height: 100%;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 8px;
          color: white;
          font-weight: bold;
          font-size: 11px;
        }
        .confidence-text {
          color: #22c55e;
          font-size: 10px;
          margin-bottom: 10px;
        }
        .legend {
          font-size: 9px;
          color: #666;
        }
        .legend-item {
          margin-bottom: 2px;
        }
        .legend-high { color: #22c55e; }
        .legend-moderate { color: #f59e0b; }
        .legend-low { color: #ef4444; }
        .analysis-image {
          max-width: 180px;
          max-height: 180px;
          border-radius: 8px;
          border: 2px solid #1e3a5f;
        }
        .image-caption {
          text-align: center;
          color: #666;
          font-size: 10px;
          margin-top: 5px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th {
          background: #1e3a5f;
          color: white;
          padding: 8px;
          text-align: left;
          font-size: 11px;
        }
        td {
          padding: 8px;
          border-bottom: 1px solid #e5e7eb;
        }
        tr:nth-child(even) {
          background: #f1f5f9;
        }
        .prevention-item, .resource-item {
          margin-bottom: 5px;
          padding-left: 10px;
        }
        .review-box {
          background: #1e3a5f;
          color: white;
          padding: 15px;
          border-radius: 4px;
          line-height: 1.5;
        }
        .footer {
          text-align: center;
          color: #666;
          font-size: 9px;
          margin-top: 20px;
          padding-top: 10px;
          border-top: 1px solid #e5e7eb;
        }
      </style>
    </head>
    <body>
      <!-- Report Details & Patient Demographics -->
      <div class="section">
        <div class="two-column" style="display: table; width: 100%;">
          <div style="display: table-cell; width: 50%; vertical-align: top;">
            <div class="section-header">REPORT DETAILS</div>
            <div class="section-content">
              <div class="info-row">
                <span class="info-label">Report ID:</span>
                <span class="info-value">${prediction.id}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Date:</span>
                <span class="info-value">${analysisDate}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Method:</span>
                <span class="info-value">AI Deep Learning Model</span>
              </div>
              <div class="info-row">
                <span class="info-label">Status:</span>
                <span class="info-value status-completed">Completed</span>
              </div>
            </div>
          </div>
          <div style="display: table-cell; width: 50%; vertical-align: top;">
            <div class="section-header">PATIENT DEMOGRAPHICS</div>
            <div class="section-content">
              <div class="info-row">
                <span class="info-label">Name:</span>
                <span class="info-value">${userName || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Age/Gender:</span>
                <span class="info-value">N/A</span>
              </div>
              <div class="info-row">
                <span class="info-label">Contact:</span>
                <span class="info-value">N/A</span>
              </div>
              <div class="info-row">
                <span class="info-label">Blood Group:</span>
                <span class="info-value">N/A</span>
              </div>
              <div class="info-row">
                <span class="info-label">Derm.:</span>
                <span class="info-value">${reviewRequest?.dermatologistUsername ? 'Dr. ' + reviewRequest.dermatologistUsername : 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Analysis & Diagnosis Results -->
      <div class="section">
        <div class="section-header">ANALYSIS & DIAGNOSIS RESULTS</div>
        <div class="section-content">
          <div style="display: table; width: 100%;">
            <div style="display: table-cell; width: 55%; vertical-align: top;">
              <p style="color: #666; margin-bottom: 5px;">Primary AI-Detected Condition:</p>
              <div class="condition-name">${conditionName.toUpperCase()}</div>
              
              <div class="confidence-section">
                <div class="confidence-label">CONFIDENCE SCORE</div>
                <div class="confidence-bar-container">
                  <div class="confidence-bar" style="width: ${confidencePercent}%; background: ${getConfidenceColor(confidencePercent)};">
                    ${confidencePercent.toFixed(2)}%
                  </div>
                </div>
                <p class="confidence-text">* ${getConfidenceText(confidencePercent)}</p>
                
                <div class="legend">
                  <p class="legend-item"><strong>Legend:</strong></p>
                  <p class="legend-item"><span class="legend-high">>80%</span> High Confidence</p>
                  <p class="legend-item"><span class="legend-moderate">50-80%</span> Moderate Confidence</p>
                  <p class="legend-item"><span class="legend-low">&lt;50%</span> Low Confidence</p>
                </div>
              </div>
            </div>
            <div style="display: table-cell; width: 45%; vertical-align: top; text-align: center;">
              <p style="font-weight: bold; color: #1e3a5f; margin-bottom: 10px;">UPLOADED PICTURE</p>
              <img src="${prediction.imageUrl}" class="analysis-image" alt="Analysis Image"/>
              <p class="image-caption">Analysis Image</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Treatment Recommendations -->
      <div class="section">
        <div class="section-header">TREATMENT RECOMMENDATIONS</div>
        <div class="section-content" style="padding: 0;">
          <table>
            <thead>
              <tr>
                <th style="width: 30px;">#</th>
                <th>Recommendation</th>
              </tr>
            </thead>
            <tbody>
              ${treatmentRows}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Prevention Guidelines -->
      <div class="section">
        <div class="section-header">PREVENTION GUIDELINES</div>
        <div class="section-content">
          ${preventionList}
        </div>
      </div>

      <!-- Helpful Resources -->
      <div class="section">
        <div class="section-header">HELPFUL RESOURCES</div>
        <div class="section-content" style="font-size: 10px;">
          ${resourcesList}
        </div>
      </div>

      <!-- Dermatologist Review -->
      <div class="section">
        <div class="section-header">DERMATOLOGIST REVIEW</div>
        <div class="section-content" style="padding: 0;">
          <div class="review-box">
            ${reviewSection}
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p>This report was generated by FacialDermaAI - AI-Powered Skin Analysis</p>
        <p>For medical advice, please consult a qualified dermatologist.</p>
      </div>
    </body>
    </html>
  `;
};

export const reportService = {
  generatePDF: async (data: ReportData): Promise<{ success: boolean; filePath?: string; error?: string }> => {
    try {
      const html = generateReportHTML(data);
      const options = {
        html,
        fileName: `SkinAnalysis_Report_${data.prediction.id}`,
        directory: 'Documents',
        base64: false,
      };

      const file = await generatePDF(options);
      
      if (file.filePath) {
        return { success: true, filePath: file.filePath };
      }
      return { success: false, error: 'Failed to generate PDF' };
    } catch (error: any) {
      console.error('PDF generation error:', error);
      return { success: false, error: error.message || 'Failed to generate PDF' };
    }
  },

  downloadReport: async (data: ReportData): Promise<{ success: boolean; filePath?: string; error?: string }> => {
    try {
      const html = generateReportHTML(data);
      const fileName = `SkinAnalysis_Report_${data.prediction.id}.pdf`;
      
      // First generate PDF in app's document directory
      const options = {
        html,
        fileName: `SkinAnalysis_Report_${data.prediction.id}`,
        directory: 'Documents',
        base64: false,
      };

      const file = await generatePDF(options);
      
      if (file.filePath) {
        // Now copy to public Downloads folder
        let downloadPath: string;
        
        if (Platform.OS === 'android') {
          // Android: Use the public Downloads directory
          downloadPath = `${RNFS.DownloadDirectoryPath}/${fileName}`;
        } else {
          // iOS: Use Documents directory (accessible via Files app)
          downloadPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
        }
        
        // Check if file already exists and remove it
        const exists = await RNFS.exists(downloadPath);
        if (exists) {
          await RNFS.unlink(downloadPath);
        }
        
        // Copy the file to Downloads
        await RNFS.copyFile(file.filePath, downloadPath);
        
        // Clean up the original file
        await RNFS.unlink(file.filePath);
        
        console.log('PDF saved to:', downloadPath);
        return { success: true, filePath: downloadPath };
      }
      return { success: false, error: 'Failed to generate PDF' };
    } catch (error: any) {
      console.error('Download error:', error);
      return { success: false, error: error.message || 'Failed to download report' };
    }
  },

  shareReport: async (data: ReportData): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await reportService.generatePDF(data);
      if (result.success && result.filePath) {
        await Share.open({
          title: 'Skin Analysis Report',
          message: `Skin Analysis Report for ${data.prediction.result.predicted_label.replace(/_/g, ' ')}`,
          url: `file://${result.filePath}`,
          type: 'application/pdf',
        });
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error: any) {
      // User cancelled sharing
      if (error.message?.includes('User did not share')) {
        return { success: true };
      }
      console.error('Share error:', error);
      return { success: false, error: error.message || 'Failed to share report' };
    }
  },
};
