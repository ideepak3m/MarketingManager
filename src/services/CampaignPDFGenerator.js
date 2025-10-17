// PDF Generation Service for Campaign Reports
// Based on modular AI-generated campaign display structure

import jsPDF from 'jspdf';

class CampaignPDFGenerator {
    constructor() {
        this.primaryColor = '#2563eb'; // Blue-600
        this.secondaryColor = '#7c3aed'; // Purple-600
        this.accentColor = '#059669'; // Green-600
        this.textColor = '#1f2937'; // Gray-800
        this.lightGray = '#f9fafb'; // Gray-50
        this.cardColors = {
            budget: [236, 253, 245], // Green-50
            timeline: [239, 246, 255], // Blue-50
            audience: [245, 243, 255], // Purple-50
            platform: [254, 249, 195], // Yellow-50
            success: [220, 252, 231] // Green-100
        };
    }

    async generateCampaignPDF(campaign) {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.width;
        const pageHeight = pdf.internal.pageSize.height;

        try {
            // 1. Campaign Introduction
            this.addCampaignIntroduction(pdf, campaign, pageWidth, pageHeight);

            // 2. Campaign Overview
            pdf.addPage();
            this.addCampaignOverview(pdf, campaign, pageWidth, pageHeight);

            // 3. Phase 1: Awareness Building
            pdf.addPage();
            this.addPhaseSection(pdf, campaign, 1, 'Awareness Building',
                'Introduce brand and spark curiosity', pageWidth, pageHeight);

            // 4. Phase 2: Engagement & Interest
            if (campaign.number_of_phases >= 2) {
                pdf.addPage();
                this.addPhaseSection(pdf, campaign, 2, 'Engagement & Interest',
                    'Build community and trust', pageWidth, pageHeight);
            }

            // 5. Phase 3: Conversion Push
            if (campaign.number_of_phases >= 3) {
                pdf.addPage();
                this.addPhaseSection(pdf, campaign, 3, 'Conversion Push',
                    'Drive purchases and conversions', pageWidth, pageHeight);
            }

            // 6. Performance Tracking
            pdf.addPage();
            this.addPerformanceTracking(pdf, campaign, pageWidth, pageHeight);

            // 7. Why This Campaign Works
            pdf.addPage();
            this.addWhyCampaignWorks(pdf, campaign, pageWidth, pageHeight);

            // 8. Call to Action
            pdf.addPage();
            this.addCallToAction(pdf, campaign, pageWidth, pageHeight);

            // Save the PDF
            const fileName = `${campaign.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_campaign_plan.pdf`;
            pdf.save(fileName);

            return {
                success: true,
                fileName: fileName,
                message: 'Professional campaign PDF generated successfully!'
            };

        } catch (error) {
            console.error('PDF Generation Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    addCoverPage(pdf, campaign, pageWidth, pageHeight) {
        // Background gradient effect (simulated with rectangles)
        pdf.setFillColor(37, 99, 235); // Blue-600
        pdf.rect(0, 0, pageWidth, pageHeight / 3, 'F');

        pdf.setFillColor(124, 58, 237); // Purple-600
        pdf.rect(0, pageHeight / 3, pageWidth, pageHeight / 3, 'F');

        pdf.setFillColor(5, 150, 105); // Green-600
        pdf.rect(0, 2 * pageHeight / 3, pageWidth, pageHeight / 3, 'F');

        // White overlay for text readability
        pdf.setFillColor(255, 255, 255);
        pdf.rect(20, 60, pageWidth - 40, 140, 'F');

        // Campaign Title
        pdf.setTextColor(31, 41, 55); // Gray-800
        pdf.setFontSize(28);
        pdf.setFont('helvetica', 'bold');

        const titleLines = pdf.splitTextToSize(campaign.name, pageWidth - 50);
        pdf.text(titleLines, pageWidth / 2, 90, { align: 'center' });

        // Subtitle
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(107, 114, 128); // Gray-500
        pdf.text('AI-Generated Marketing Campaign Plan', pageWidth / 2, 110, { align: 'center' });

        // Campaign Type Badge
        pdf.setFillColor(37, 99, 235);
        pdf.roundedRect(pageWidth / 2 - 25, 120, 50, 10, 2, 2, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.text(campaign.campaign_type.toUpperCase(), pageWidth / 2, 127, { align: 'center' });

        // Status
        const statusColor = campaign.status === 'active' ? [34, 197, 94] :
            campaign.status === 'draft' ? [251, 191, 36] : [107, 114, 128];
        pdf.setFillColor(...statusColor);
        pdf.roundedRect(pageWidth / 2 - 20, 135, 40, 8, 2, 2, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(9);
        pdf.text(campaign.status.toUpperCase(), pageWidth / 2, 141, { align: 'center' });

        // Created by AI credit
        pdf.setTextColor(107, 114, 128);
        pdf.setFontSize(10);
        pdf.text('Generated by Nova AI • Priority One Tech Inc', pageWidth / 2, 180, { align: 'center' });

        // Footer
        pdf.setTextColor(156, 163, 175);
        pdf.setFontSize(8);
        const currentDate = new Date().toLocaleDateString();
        pdf.text(`Generated on ${currentDate}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    addOverviewPage(pdf, campaign, pageWidth, pageHeight) {
        let yPosition = 30;

        // Page Title
        pdf.setTextColor(31, 41, 55);
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Campaign Overview', 20, yPosition);
        yPosition += 20;

        // Description Section
        if (campaign.description) {
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Description', 20, yPosition);
            yPosition += 8;

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(10);
            const descLines = pdf.splitTextToSize(campaign.description, pageWidth - 40);
            pdf.text(descLines, 20, yPosition);
            yPosition += descLines.length * 5 + 10;
        }

        // Key Metrics Cards
        this.addMetricsSection(pdf, campaign, pageWidth, yPosition);
    }

    addMetricsSection(pdf, campaign, pageWidth, yPosition) {
        const cardWidth = (pageWidth - 60) / 3;
        const cardHeight = 30;

        // Budget Card
        pdf.setFillColor(236, 253, 245); // Green-50
        pdf.rect(20, yPosition, cardWidth, cardHeight, 'F');
        pdf.setDrawColor(167, 243, 208); // Green-200
        pdf.rect(20, yPosition, cardWidth, cardHeight);

        pdf.setTextColor(5, 150, 105);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        const budget = campaign.budget ? `$${parseInt(campaign.budget).toLocaleString()}` : 'TBD';
        pdf.text(budget, 20 + cardWidth / 2, yPosition + 15, { align: 'center' });

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Total Budget', 20 + cardWidth / 2, yPosition + 25, { align: 'center' });

        // Duration Card
        const xPos2 = 30 + cardWidth;
        pdf.setFillColor(239, 246, 255); // Blue-50
        pdf.rect(xPos2, yPosition, cardWidth, cardHeight, 'F');
        pdf.setDrawColor(191, 219, 254); // Blue-200
        pdf.rect(xPos2, yPosition, cardWidth, cardHeight);

        pdf.setTextColor(37, 99, 235);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        const duration = campaign.campaign_length || 'TBD';
        pdf.text(duration, xPos2 + cardWidth / 2, yPosition + 15, { align: 'center' });

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Duration', xPos2 + cardWidth / 2, yPosition + 25, { align: 'center' });

        // Phases Card
        const xPos3 = 40 + 2 * cardWidth;
        pdf.setFillColor(245, 243, 255); // Purple-50
        pdf.rect(xPos3, yPosition, cardWidth, cardHeight, 'F');
        pdf.setDrawColor(221, 214, 254); // Purple-200
        pdf.rect(xPos3, yPosition, cardWidth, cardHeight);

        pdf.setTextColor(124, 58, 237);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text(campaign.number_of_phases.toString(), xPos3 + cardWidth / 2, yPosition + 15, { align: 'center' });

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Phases', xPos3 + cardWidth / 2, yPosition + 25, { align: 'center' });
    }

    addGoalsPage(pdf, campaign, pageWidth, pageHeight) {
        let yPosition = 30;

        // Page Title
        pdf.setTextColor(31, 41, 55);
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Goals & Strategy', 20, yPosition);
        yPosition += 20;

        // Goals Section
        if (campaign.goals) {
            pdf.setFontSize(14);
            pdf.setFont('helvetica', 'bold');
            pdf.text('Campaign Goals', 20, yPosition);
            yPosition += 10;

            // Parse and display goals
            try {
                const goals = typeof campaign.goals === 'string' ?
                    JSON.parse(campaign.goals) : campaign.goals;

                Object.entries(goals).forEach(([key, value]) => {
                    pdf.setFontSize(10);
                    pdf.setFont('helvetica', 'bold');
                    pdf.text(`${key.replace(/_/g, ' ').toUpperCase()}:`, 25, yPosition);
                    yPosition += 6;

                    pdf.setFont('helvetica', 'normal');
                    const valueText = typeof value === 'object' ?
                        JSON.stringify(value, null, 2) : value.toString();
                    const lines = pdf.splitTextToSize(valueText, pageWidth - 50);
                    pdf.text(lines, 30, yPosition);
                    yPosition += lines.length * 4 + 8;
                });
            } catch (error) {
                pdf.setFont('helvetica', 'normal');
                pdf.text('Goals data format not available for display', 25, yPosition);
            }
        }
    }

    addTimelinePage(pdf, campaign, pageWidth, pageHeight) {
        let yPosition = 30;

        // Page Title
        pdf.setTextColor(31, 41, 55);
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Timeline & Phases', 20, yPosition);
        yPosition += 20;

        // Timeline visualization
        const startDate = campaign.start_date ? new Date(campaign.start_date) : new Date();
        const endDate = campaign.end_date ? new Date(campaign.end_date) :
            new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days default

        // Timeline bar
        const timelineWidth = pageWidth - 40;
        const timelineY = yPosition;

        pdf.setFillColor(37, 99, 235);
        pdf.rect(20, timelineY, timelineWidth, 6, 'F');

        // Start and end markers
        pdf.setFillColor(34, 197, 94);
        pdf.circle(20, timelineY + 3, 3, 'F');
        pdf.circle(20 + timelineWidth, timelineY + 3, 3, 'F');

        // Date labels
        pdf.setTextColor(107, 114, 128);
        pdf.setFontSize(9);
        pdf.text(startDate.toLocaleDateString(), 20, timelineY + 12, { align: 'center' });
        pdf.text(endDate.toLocaleDateString(), 20 + timelineWidth, timelineY + 12, { align: 'center' });

        yPosition += 25;

        // Phase breakdown
        pdf.setTextColor(31, 41, 55);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Campaign Phases', 20, yPosition);
        yPosition += 15;

        for (let i = 0; i < campaign.number_of_phases; i++) {
            pdf.setFillColor(245, 243, 255);
            pdf.rect(20, yPosition, pageWidth - 40, 20, 'F');
            pdf.setDrawColor(221, 214, 254);
            pdf.rect(20, yPosition, pageWidth - 40, 20);

            pdf.setTextColor(124, 58, 237);
            pdf.setFontSize(12);
            pdf.setFont('helvetica', 'bold');
            pdf.text(`Phase ${i + 1}`, 25, yPosition + 8);

            pdf.setTextColor(107, 114, 128);
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'normal');
            pdf.text('Duration: TBD • Status: Planned', 25, yPosition + 16);

            yPosition += 25;
        }
    }

    addBudgetPage(pdf, campaign, pageWidth, pageHeight) {
        let yPosition = 30;

        // Page Title
        pdf.setTextColor(31, 41, 55);
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Budget & Metrics', 20, yPosition);
        yPosition += 30;

        // Budget breakdown (placeholder for now)
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Budget Allocation', 20, yPosition);
        yPosition += 15;

        const totalBudget = campaign.budget || 0;

        // Budget items
        const budgetItems = [
            { name: 'Advertising Spend', percentage: 60, amount: totalBudget * 0.6 },
            { name: 'Content Creation', percentage: 25, amount: totalBudget * 0.25 },
            { name: 'Analytics & Tools', percentage: 10, amount: totalBudget * 0.1 },
            { name: 'Contingency', percentage: 5, amount: totalBudget * 0.05 }
        ];

        budgetItems.forEach((item, index) => {
            const barWidth = (pageWidth - 100) * (item.percentage / 100);
            const colors = [[37, 99, 235], [124, 58, 237], [5, 150, 105], [251, 191, 36]];

            pdf.setFillColor(...colors[index]);
            pdf.rect(80, yPosition, barWidth, 12, 'F');

            pdf.setTextColor(31, 41, 55);
            pdf.setFontSize(10);
            pdf.text(item.name, 25, yPosition + 8);
            pdf.text(`${item.percentage}%`, 25, yPosition + 16);
            pdf.text(`$${Math.round(item.amount).toLocaleString()}`, pageWidth - 50, yPosition + 8);

            yPosition += 25;
        });

        // Footer with branding
        pdf.setTextColor(107, 114, 128);
        pdf.setFontSize(8);
        pdf.text('Generated by Priority One Tech Inc • AI-Powered Marketing Solutions',
            pageWidth / 2, pageHeight - 15, { align: 'center' });
    }

    // 1. Campaign Introduction - Set tone and hook audience
    addCampaignIntroduction(pdf, campaign, pageWidth, pageHeight) {
        // Hero Background
        pdf.setFillColor(37, 99, 235); // Blue gradient
        pdf.rect(0, 0, pageWidth, 80, 'F');

        // Hero Headline
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(32);
        pdf.setFont('helvetica', 'bold');
        const heroHeadline = this.generateHeroHeadline(campaign);
        const titleLines = pdf.splitTextToSize(heroHeadline, pageWidth - 40);
        pdf.text(titleLines, pageWidth / 2, 35, { align: 'center' });

        // One-paragraph summary
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(255, 255, 255);
        const summary = this.generateCampaignSummary(campaign);
        const summaryLines = pdf.splitTextToSize(summary, pageWidth - 40);
        pdf.text(summaryLines, pageWidth / 2, 55, { align: 'center' });

        // Visual Cards Section
        let yPos = 100;
        this.addVisualCard(pdf, 'Campaign', campaign.name, 20, yPos, 40, 30, this.cardColors.budget);
        this.addVisualCard(pdf, 'Duration', campaign.campaign_length || '8 weeks', 70, yPos, 40, 30, this.cardColors.timeline);
        this.addVisualCard(pdf, 'Budget', this.formatBudget(campaign.budget), 120, yPos, 40, 30, this.cardColors.audience);
        this.addVisualCard(pdf, 'Platforms', this.getPlatforms(campaign), 170, yPos, 40, 30, this.cardColors.platform);

        // Nova AI Credit
        pdf.setTextColor(107, 114, 128);
        pdf.setFontSize(10);
        pdf.text('Generated by Nova AI • Priority One Tech Inc', pageWidth / 2, pageHeight - 10, { align: 'center' });
    }

    // 2. Campaign Overview - Strategic arc explanation
    addCampaignOverview(pdf, campaign, pageWidth, pageHeight) {
        let yPos = 30;

        this.addSectionTitle(pdf, 'Campaign Overview', yPos);
        yPos += 20;

        // Strategic Summary
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(31, 41, 55);
        pdf.text('Strategic Summary', 20, yPos);
        yPos += 8;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        const strategicSummary = this.generateStrategicSummary(campaign);
        const strategyLines = pdf.splitTextToSize(strategicSummary, pageWidth - 40);
        pdf.text(strategyLines, 20, yPos);
        yPos += strategyLines.length * 5 + 15;

        // Overview Cards
        const cardWidth = (pageWidth - 60) / 2;
        const cardHeight = 40;

        this.addOverviewCard(pdf, 'Timeline Breakdown', this.getTimelineBreakdown(campaign),
            20, yPos, cardWidth, cardHeight, this.cardColors.timeline);

        this.addOverviewCard(pdf, 'Target Audience', this.getTargetAudience(campaign),
            30 + cardWidth, yPos, cardWidth, cardHeight, this.cardColors.audience);

        yPos += cardHeight + 15;

        this.addOverviewCard(pdf, 'Budget Allocation', this.getBudgetAllocation(campaign),
            20, yPos, cardWidth, cardHeight, this.cardColors.budget);

        this.addOverviewCard(pdf, 'Platform Strategy', this.getPlatformStrategy(campaign),
            30 + cardWidth, yPos, cardWidth, cardHeight, this.cardColors.platform);
    }

    // Helper Methods for Content Generation
    generateHeroHeadline(campaign) {
        return campaign.name || 'Boost Sales with Smart Marketing';
    }

    generateCampaignSummary(campaign) {
        return campaign.description ||
            'AI-optimized campaign designed to maximize engagement and drive conversions through strategic phased approach.';
    }

    generateStrategicSummary(campaign) {
        return `This ${campaign.number_of_phases}-phase campaign leverages proven marketing strategies to deliver measurable results. Each phase builds upon the previous, creating momentum that drives sustained growth and customer engagement.`;
    }

    formatBudget(budget) {
        if (!budget || budget === 0) return 'TBD';
        return `$${parseFloat(budget).toLocaleString()}`;
    }

    getPlatforms(campaign) {
        if (campaign.platforms && campaign.platforms.length > 0) {
            return campaign.platforms.join(', ');
        }
        return 'Facebook, Instagram';
    }

    getTimelineBreakdown(campaign) {
        return `${campaign.number_of_phases}-phase strategy over ${campaign.campaign_length || '8 weeks'}`;
    }

    getTargetAudience(campaign) {
        try {
            if (campaign.target_audience) {
                const audience = typeof campaign.target_audience === 'string' ?
                    JSON.parse(campaign.target_audience) : campaign.target_audience;
                return audience.target_audience || 'Value-conscious shoppers';
            }
        } catch (e) { }
        return 'Value-conscious shoppers';
    }

    getBudgetAllocation(campaign) {
        const budget = parseFloat(campaign.budget) || 2000;
        return `$${budget.toLocaleString()} strategic allocation`;
    }

    getPlatformStrategy(campaign) {
        const platforms = this.getPlatforms(campaign);
        return `Multi-channel approach: ${platforms}`;
    }

    // UI Helper Methods
    addSectionTitle(pdf, title, yPos) {
        pdf.setTextColor(31, 41, 55);
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, 20, yPos);
    }

    addVisualCard(pdf, label, value, x, y, width, height, color) {
        pdf.setFillColor(...color);
        pdf.rect(x, y, width, height, 'F');
        pdf.setDrawColor(200, 200, 200);
        pdf.rect(x, y, width, height);

        pdf.setTextColor(31, 41, 55);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text(label, x + width / 2, y + 8, { align: 'center' });

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const valueLines = pdf.splitTextToSize(value, width - 4);
        pdf.text(valueLines, x + width / 2, y + 18, { align: 'center' });
    }

    addOverviewCard(pdf, title, content, x, y, width, height, color) {
        pdf.setFillColor(...color);
        pdf.rect(x, y, width, height, 'F');
        pdf.setDrawColor(200, 200, 200);
        pdf.rect(x, y, width, height);

        pdf.setTextColor(31, 41, 55);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, x + 5, y + 12);

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const contentLines = pdf.splitTextToSize(content, width - 10);
        pdf.text(contentLines, x + 5, y + 22);
    }

    addPhaseDetails(pdf, campaign, phaseNumber, phaseName, yPos, pageWidth) {
        // Phase goals and strategy based on phase number
        const phaseStrategies = {
            1: {
                goals: 'Build brand awareness and spark initial interest',
                tactics: ['Social media teasers', 'Brand introduction content', 'Audience building'],
                metrics: ['Reach: 25K+', 'Engagement Rate: 3%+', 'Follower Growth: 500+']
            },
            2: {
                goals: 'Engage audience and build trust through valuable content',
                tactics: ['Educational content', 'User-generated content', 'Community building'],
                metrics: ['Engagement Rate: 5%+', 'Content Shares: 200+', 'Comments: 150+']
            },
            3: {
                goals: 'Convert engaged audience into customers',
                tactics: ['Promotional campaigns', 'Limited-time offers', 'Retargeting'],
                metrics: ['Conversion Rate: 3%+', 'Sales: $500+', 'ROAS: 3:1+']
            }
        };

        const strategy = phaseStrategies[phaseNumber] || phaseStrategies[1];

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(31, 41, 55);
        pdf.text('Phase Goals', 20, yPos);
        yPos += 8;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        const goalsLines = pdf.splitTextToSize(strategy.goals, pageWidth - 40);
        pdf.text(goalsLines, 20, yPos);
        yPos += goalsLines.length * 5 + 15;

        // Tactics
        pdf.setFont('helvetica', 'bold');
        pdf.text('Key Tactics', 20, yPos);
        yPos += 8;

        strategy.tactics.forEach(tactic => {
            pdf.setFont('helvetica', 'normal');
            pdf.text(`• ${tactic}`, 25, yPos);
            yPos += 6;
        });
        yPos += 10;

        // Success Metrics
        pdf.setFont('helvetica', 'bold');
        pdf.text('Success Metrics', 20, yPos);
        yPos += 8;

        strategy.metrics.forEach(metric => {
            pdf.setFont('helvetica', 'normal');
            pdf.text(`• ${metric}`, 25, yPos);
            yPos += 6;
        });
    }

    addKPICard(pdf, title, target, x, y, width, height) {
        pdf.setFillColor(...this.cardColors.success);
        pdf.rect(x, y, width, height, 'F');
        pdf.setDrawColor(200, 200, 200);
        pdf.rect(x, y, width, height);

        pdf.setTextColor(31, 41, 55);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text(title, x + width / 2, y + 15, { align: 'center' });

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(target, x + width / 2, y + 25, { align: 'center' });
    }

    addROISection(pdf, campaign, yPos, pageWidth) {
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(31, 41, 55);
        pdf.text('Expected ROI', 20, yPos);
        yPos += 10;

        const budget = parseFloat(campaign.budget) || 2000;
        const expectedReturn = budget * 3; // 3:1 ROI assumption

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Investment: ${this.formatBudget(budget)}`, 25, yPos);
        yPos += 8;
        pdf.text(`Expected Return: $${expectedReturn.toLocaleString()}`, 25, yPos);
        yPos += 8;
        pdf.text(`ROI: 200% (3:1 return)`, 25, yPos);
    }

    addReasonCard(pdf, reason, x, y, width, height) {
        pdf.setFillColor(245, 243, 255); // Purple-50
        pdf.rect(x, y, width, height, 'F');
        pdf.setDrawColor(221, 214, 254);
        pdf.rect(x, y, width, height);

        pdf.setTextColor(124, 58, 237);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(reason.title, x + 5, y + 8);

        pdf.setTextColor(75, 85, 99);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const descLines = pdf.splitTextToSize(reason.description, width - 10);
        pdf.text(descLines, x + 5, y + 18);
    }

    addCTACard(pdf, campaign, yPos, pageWidth) {
        pdf.setFillColor(37, 99, 235); // Blue
        pdf.rect(20, yPos, pageWidth - 40, 50, 'F');

        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Campaign Launch Details', pageWidth / 2, yPos + 15, { align: 'center' });

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        const launchDate = campaign.start_date ?
            new Date(campaign.start_date).toLocaleDateString() : 'Ready to launch';

        pdf.text(`Launch Date: ${launchDate}`, pageWidth / 2, yPos + 25, { align: 'center' });
        pdf.text(`Budget: ${this.formatBudget(campaign.budget)}`, pageWidth / 2, yPos + 35, { align: 'center' });
        pdf.text(`Goal: Drive measurable results through ${campaign.number_of_phases} strategic phases`, pageWidth / 2, yPos + 45, { align: 'center' });
    }
}

export default CampaignPDFGenerator;