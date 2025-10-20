// Professional Campaign Report Generator (HTML/CSS for Print-to-PDF)
// Matches Gamma AI quality and design standards

class CampaignReportGenerator {
    constructor() {
        this.primaryColor = '#4F46E5'; // Indigo
        this.secondaryColor = '#7C3AED'; // Violet
        this.accentColor = '#059669'; // Emerald
        this.gradientBg = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }

    generateCampaignReport(campaign) {
        try {
            const reportHTML = this.createReportHTML(campaign);

            // Open in new window for print-to-PDF
            const newWindow = window.open('', '_blank', 'width=1200,height=800');
            newWindow.document.write(reportHTML);
            newWindow.document.close();

            // Focus and suggest printing
            newWindow.focus();
            // Removed alert popup for report instructions

            return {
                success: true,
                message: 'Professional campaign report opened in new window. Ready for PDF export!'
            };

        } catch (error) {
            console.error('Report Generation Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    createReportHTML(campaign) {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${campaign.name} - Campaign Strategy Report</title>
    <style>
        ${this.getReportCSS()}
    </style>
</head>
<body>
    <div class="report-container">
        ${this.generateCoverPage(campaign)}
        ${this.generateOverviewPage(campaign)}
        ${this.generatePhasePages(campaign)}
        ${this.generatePerformancePage(campaign)}
        ${this.generateSuccessFactorsPage(campaign)}
        ${this.generateCallToActionPage(campaign)}
    </div>
</body>
</html>
        `;
    }

    getReportCSS() {
        return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: white;
        }

        .report-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
        }

        .page {
            min-height: 100vh;
            padding: 40px;
            page-break-after: always;
            display: flex;
            flex-direction: column;
        }

        .page:last-child {
            page-break-after: avoid;
        }

        /* Cover Page */
        .cover-page {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            justify-content: center;
            align-items: center;
            display: flex;
            flex-direction: column;
        }

        .cover-title {
            font-size: 3.5rem;
            font-weight: 800;
            margin-bottom: 1rem;
            line-height: 1.2;
        }

        .cover-subtitle {
            font-size: 1.5rem;
            font-weight: 300;
            margin-bottom: 3rem;
            opacity: 0.9;
        }

        .cover-meta {
            background: rgba(255, 255, 255, 0.15);
            padding: 2rem;
            border-radius: 1rem;
            backdrop-filter: blur(10px);
        }

        .cover-meta h3 {
            font-size: 1.25rem;
            margin-bottom: 1rem;
        }

        .cover-stats {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            margin-top: 1rem;
        }

        .cover-stat {
            text-align: center;
        }

        .cover-stat-value {
            font-size: 1.5rem;
            font-weight: 700;
        }

        .cover-stat-label {
            font-size: 0.875rem;
            opacity: 0.8;
        }

        /* Page Headers */
        .page-header {
            text-align: center;
            margin-bottom: 3rem;
        }

        .page-title {
            font-size: 2.5rem;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 0.5rem;
        }

        .page-subtitle {
            font-size: 1.125rem;
            color: #6b7280;
        }

        /* Cards */
        .card-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 2rem;
            margin-bottom: 3rem;
        }

        .card {
            background: #f8fafc;
            border-radius: 1rem;
            padding: 2rem;
            border-left: 4px solid #4f46e5;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .card-header {
            display: flex;
            align-items: center;
            margin-bottom: 1rem;
        }

        .card-icon {
            width: 3rem;
            height: 3rem;
            background: #4f46e5;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 1rem;
            color: white;
            font-size: 1.25rem;
        }

        .card-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #1f2937;
        }

        .card-content {
            color: #4b5563;
            line-height: 1.6;
        }

        /* Phase Sections */
        .phase-header {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: white;
            padding: 2rem;
            border-radius: 1rem;
            margin-bottom: 2rem;
            text-align: center;
        }

        .phase-title {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .phase-duration {
            font-size: 1.125rem;
            opacity: 0.9;
        }

        .section {
            margin-bottom: 3rem;
        }

        .section-title {
            font-size: 1.5rem;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 1rem;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 0.5rem;
        }

        .content-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3rem;
        }

        .content-list {
            list-style: none;
        }

        .content-list li {
            padding: 0.75rem 0;
            border-bottom: 1px solid #f3f4f6;
            display: flex;
            align-items: flex-start;
        }

        .content-list li:before {
            content: "✓";
            color: #059669;
            font-weight: bold;
            margin-right: 0.75rem;
            margin-top: 0.125rem;
        }

        /* Metrics */
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 1.5rem;
            margin: 2rem 0;
        }

        .metric-card {
            background: white;
            border: 2px solid #e5e7eb;
            border-radius: 1rem;
            padding: 1.5rem;
            text-align: center;
        }

        .metric-value {
            font-size: 2.5rem;
            font-weight: 800;
            color: #4f46e5;
            margin-bottom: 0.5rem;
        }

        .metric-label {
            font-size: 0.875rem;
            color: #6b7280;
            font-weight: 500;
        }

        /* Success Factors */
        .success-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 2rem;
        }

        .success-card {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border-radius: 1rem;
            padding: 2rem;
            border-left: 4px solid #0ea5e9;
        }

        .success-card h3 {
            font-size: 1.25rem;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 1rem;
        }

        /* Timeline */
        .timeline {
            position: relative;
            padding-left: 2rem;
        }

        .timeline:before {
            content: '';
            position: absolute;
            left: 1rem;
            top: 0;
            bottom: 0;
            width: 2px;
            background: #e5e7eb;
        }

        .timeline-item {
            position: relative;
            margin-bottom: 2rem;
            padding-left: 2rem;
        }

        .timeline-item:before {
            content: '';
            position: absolute;
            left: -0.5rem;
            top: 0.5rem;
            width: 1rem;
            height: 1rem;
            background: #4f46e5;
            border-radius: 50%;
        }

        .timeline-title {
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 0.5rem;
        }

        .timeline-description {
            color: #6b7280;
            font-size: 0.875rem;
        }

        /* CTA Section */
        .cta-section {
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            color: white;
            padding: 3rem;
            border-radius: 1rem;
            text-align: center;
            margin-top: 2rem;
        }

        .cta-title {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 1rem;
        }

        .cta-description {
            font-size: 1.125rem;
            margin-bottom: 2rem;
            opacity: 0.9;
        }

        .campaign-summary {
            background: rgba(255, 255, 255, 0.15);
            padding: 2rem;
            border-radius: 1rem;
            backdrop-filter: blur(10px);
        }

        .summary-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
            text-align: left;
        }

        .summary-item {
            display: flex;
            justify-content: space-between;
            padding: 0.5rem 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        /* Print Optimizations */
        @media print {
            .page {
                page-break-after: always;
                min-height: auto;
                padding: 20px;
            }
            
            .page:last-child {
                page-break-after: avoid;
            }
            
            .report-container {
                max-width: none;
            }
        }
        `;
    }

    generateCoverPage(campaign) {
        const startDate = campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : 'TBD';
        const budget = campaign.budget ? `$${campaign.budget.toLocaleString()}` : 'TBD';

        return `
        <div class="page cover-page">
            <div class="cover-title">${campaign.name || 'Campaign Strategy'}</div>
            <div class="cover-subtitle">Your Roadmap to Success</div>
            
            <div class="cover-meta">
                <h3>Campaign Overview</h3>
                <div class="cover-stats">
                    <div class="cover-stat">
                        <div class="cover-stat-value">${campaign.campaign_length || '8 weeks'}</div>
                        <div class="cover-stat-label">Duration</div>
                    </div>
                    <div class="cover-stat">
                        <div class="cover-stat-value">${budget}</div>
                        <div class="cover-stat-label">Investment</div>
                    </div>
                    <div class="cover-stat">
                        <div class="cover-stat-value">${campaign.number_of_phases || 3}</div>
                        <div class="cover-stat-label">Phases</div>
                    </div>
                    <div class="cover-stat">
                        <div class="cover-stat-value">${startDate}</div>
                        <div class="cover-stat-label">Launch Date</div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    generateOverviewPage(campaign) {
        const targetAudience = this.getTargetAudience(campaign);
        const platforms = this.getPlatformsString(campaign);
        const duration = this.getCampaignDuration(campaign);
        const budget = campaign.budget ? `$${campaign.budget.toLocaleString()} strategically allocated across three phases for maximum impact and ROI` : 'Strategic budget allocation for optimal performance';

        return `
        <div class="page">
            <div class="page-header">
                <div class="page-title">Campaign Overview: Your Roadmap to Success</div>
            </div>
            
            <p style="font-size: 1.125rem; color: #4b5563; margin-bottom: 3rem; text-align: center; line-height: 1.8;">
                Our strategic approach combines creativity, data-driven insights, and proven social media tactics to deliver results that matter. 
                Over the next ${campaign.campaign_length || '8 weeks'}, we'll guide ${targetAudience} through a thoughtfully designed experience that transforms curiosity into conversion.
            </p>

            <div class="card-grid">
                <div class="card">
                    <div class="card-header">
                        <div class="card-icon">👥</div>
                        <div class="card-title">Target Audience</div>
                    </div>
                    <div class="card-content">
                        ${targetAudience}
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <div class="card-icon">📅</div>
                        <div class="card-title">Campaign Duration</div>
                    </div>
                    <div class="card-content">
                        ${duration}
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <div class="card-icon">💰</div>
                        <div class="card-title">Smart Budget</div>
                    </div>
                    <div class="card-content">
                        ${budget}
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <div class="card-icon">📱</div>
                        <div class="card-title">Platform Focus</div>
                    </div>
                    <div class="card-content">
                        ${platforms}—where your audience spends time discovering and sharing deals
                    </div>
                </div>
            </div>

            <p style="font-size: 1rem; color: #4b5563; text-align: center; line-height: 1.8;">
                This campaign leverages the power of social proof, visual storytelling, and strategic timing to capture attention, 
                build trust, and drive measurable results throughout each carefully planned phase.
            </p>
        </div>
        `;
    }

    generatePhasePages(campaign) {
        const phases = [
            {
                number: 1,
                title: 'Awareness Building',
                subtitle: 'Capturing Hearts and Minds',
                description: 'The first three weeks are all about making a memorable first impression. During this crucial awareness phase, we\'ll flood your target audience\'s feeds with visually stunning content that stops the scroll and sparks curiosity.',
                contentStrategy: [
                    'High-quality product imagery highlighting condition and quality',
                    'Before-and-after style posts showing value comparison',
                    'Carousel posts featuring diverse product categories',
                    'Short video clips demonstrating product quality',
                    'Brand story content building trust and credibility'
                ],
                successMetrics: [
                    'Reach: 10,000 unique viewers',
                    'Engagement Rate: 2% across all content',
                    'Key Focus: Initial reach and engagement metrics',
                    'Platform Mix: 50% Facebook, 50% Instagram',
                    'Content Types: Images, videos, carousels'
                ]
            },
            {
                number: 2,
                title: 'Engagement & Interest',
                subtitle: 'Building Community and Trust',
                description: 'Creating meaningful engagement requires more than just posting content—it demands strategy, authenticity, and a deep understanding of what makes your audience tick. During Phase 2, we\'ll implement proven tactics that transform passive viewers into active participants.',
                contentStrategy: [
                    'Conversation starters with engaging questions',
                    'Customer story features and testimonials',
                    'Interactive polls and community engagement',
                    'Behind-the-scenes content and transparency',
                    'User-generated content campaigns'
                ],
                successMetrics: [
                    'Engagement quality improvement',
                    'Lead generation and email signups',
                    'Social shares and saves increase',
                    'Community growth and interaction',
                    'Brand sentiment monitoring'
                ]
            },
            {
                number: 3,
                title: 'Conversion Push',
                subtitle: 'Converting Interest into Revenue',
                description: 'The moment we\'ve been building toward has arrived! Phase 3 is where all our groundwork pays off with a strategic sales offensive designed to convert engaged followers into enthusiastic customers.',
                contentStrategy: [
                    'Limited-time offers and flash sales',
                    'Retargeting campaigns for warm prospects',
                    'Social proof and customer testimonials',
                    'Urgency-driven messaging and countdowns',
                    'Clear calls-to-action and purchase paths'
                ],
                successMetrics: [
                    'Total Reach: 20,000 users',
                    'Engagement Rate: 3%',
                    'Conversion Increase: 10%',
                    'ROI Focus: Revenue per ad dollar',
                    'Customer Acquisition: New buyers'
                ]
            }
        ];

        return phases.slice(0, campaign.number_of_phases || 3).map(phase => `
        <div class="page">
            <div class="phase-header">
                <div class="phase-title">Phase ${phase.number}: ${phase.title}</div>
                <div class="phase-duration">${phase.subtitle}</div>
            </div>

            <p style="font-size: 1rem; color: #4b5563; margin-bottom: 2rem; line-height: 1.8;">
                ${phase.description}
            </p>

            <div class="content-grid">
                <div class="section">
                    <h3 class="section-title">Content Strategy</h3>
                    <p style="margin-bottom: 1rem; color: #6b7280;">Focus on ${phase.number === 1 ? 'visually striking content that showcases product variety and unbeatable value' : phase.number === 2 ? 'building deeper relationships through educational and entertaining content' : 'conversion-focused content with urgency and clear calls-to-action'}:</p>
                    <ul class="content-list">
                        ${phase.contentStrategy.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>

                <div class="section">
                    <h3 class="section-title">Success Metrics</h3>
                    <p style="margin-bottom: 1rem; color: #6b7280;">We're targeting ${phase.number === 1 ? 'ambitious but achievable goals' : phase.number === 2 ? 'deeper engagement and community building' : 'maximum conversion and ROI'} for this phase:</p>
                    <ul class="content-list">
                        ${phase.successMetrics.map(metric => `<li>${metric}</li>`).join('')}
                    </ul>
                </div>
            </div>

            <p style="font-size: 0.875rem; color: #6b7280; margin-top: 2rem; text-align: center; font-style: italic;">
                ${phase.number === 1 ? 'By the end of week three, your brand will be firmly planted in the minds of thousands of value-seekers.' :
                phase.number === 2 ? 'This phase sets the foundation for the conversion-focused finale, as engaged audiences are significantly more likely to purchase.' :
                    'With the holiday season in full swing and your audience primed and ready, we\'ll deploy time-sensitive offers and persuasive messaging.'}
            </p>
        </div>
        `).join('');
    }

    generatePerformancePage(campaign) {
        return `
        <div class="page">
            <div class="page-header">
                <div class="page-title">Campaign Performance Tracking</div>
                <div class="page-subtitle">Success isn't just about feeling good—it's about measurable results that prove ROI</div>
            </div>

            <p style="font-size: 1rem; color: #4b5563; margin-bottom: 3rem; text-align: center; line-height: 1.8;">
                Throughout our ${campaign.campaign_length || '8-week'} campaign, we'll track key performance indicators that tell the story of growth, engagement, and conversion. 
                This data-driven approach ensures we can optimize in real-time and demonstrate clear value.
            </p>

            <div class="metrics-grid">
                <div class="metric-card">
                    <div class="metric-value">20K</div>
                    <div class="metric-label">Total Reach</div>
                    <div style="font-size: 0.75rem; color: #9ca3af; margin-top: 0.5rem;">Unique users exposed to campaign content across Facebook and Instagram</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">3%</div>
                    <div class="metric-label">Engagement Rate</div>
                    <div style="font-size: 0.75rem; color: #9ca3af; margin-top: 0.5rem;">Average interaction rate across all content types and phases</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">10%</div>
                    <div class="metric-label">Conversion Lift</div>
                    <div style="font-size: 0.75rem; color: #9ca3af; margin-top: 0.5rem;">Increase in sales conversion rate from engaged audience</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">${campaign.budget ? '$' + campaign.budget.toLocaleString().slice(0, -3) + 'K' : '$2K'}</div>
                    <div class="metric-label">Smart Budget</div>
                    <div style="font-size: 0.75rem; color: #9ca3af; margin-top: 0.5rem;">Strategically allocated investment delivering maximum return on ad spend</div>
                </div>
            </div>

            <div class="section">
                <h3 class="section-title">Key Performance Indicators</h3>
                <div class="card-grid">
                    <div class="card">
                        <div class="card-header">
                            <div class="card-icon">📊</div>
                            <div class="card-title">Tracking Tools</div>
                        </div>
                        <div class="card-content">
                            <ul class="content-list" style="margin-top: 1rem;">
                                <li>Google Analytics 4: Website traffic and conversions</li>
                                <li>Facebook Pixel: Social media campaign tracking</li>
                                <li>UTM Parameters: Campaign source identification</li>
                                <li>Conversion Tracking: Cross-platform attribution</li>
                            </ul>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <div class="card-icon">📅</div>
                            <div class="card-title">Reporting Schedule</div>
                        </div>
                        <div class="card-content">
                            <ul class="content-list" style="margin-top: 1rem;">
                                <li>Daily: Monitor ad spend and key metrics</li>
                                <li>Weekly: Comprehensive performance review</li>
                                <li>Bi-weekly: Campaign optimization adjustments</li>
                                <li>Monthly: Full campaign analysis and reporting</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    generateSuccessFactorsPage(campaign) {
        return `
        <div class="page">
            <div class="page-header">
                <div class="page-title">Why This Campaign Will Succeed</div>
                <div class="page-subtitle">Strategic advantages and proven methodologies</div>
            </div>

            <p style="font-size: 1rem; color: #4b5563; margin-bottom: 3rem; text-align: center; line-height: 1.8;">
                This isn't just another social media campaign—it's a comprehensive strategy built on proven marketing principles and deep audience understanding. 
                We've designed every element to work synergistically, creating momentum that builds throughout the ${campaign.campaign_length || '8 weeks'} and delivers results that exceed expectations.
            </p>

            <div class="success-grid">
                <div class="success-card">
                    <h3>🎯 Perfect Timing</h3>
                    <p>Launching ${campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : 'at the optimal moment'} positions us perfectly for ${campaign.campaign_type === 'holiday' ? 'holiday shopping season when consumers are actively seeking gifts and deals, with peak activity in December' : 'maximum market impact when your target audience is most engaged and ready to purchase'}.</p>
                </div>

                <div class="success-card">
                    <h3>📱 Platform Mastery</h3>
                    <p>${this.getPlatformsString(campaign)} dominate social commerce, offering sophisticated targeting, visual storytelling capabilities, and native shopping features that streamline the purchase journey from discovery to conversion.</p>
                </div>

                <div class="success-card">
                    <h3>👥 Audience Alignment</h3>
                    <p>${this.getTargetAudience(campaign)} are actively searching for deals on social media—we're meeting them exactly where they are with exactly what they want, creating perfect market-message alignment.</p>
                </div>

                <div class="success-card">
                    <h3>🚀 Phased Approach</h3>
                    <p>Our ${campaign.number_of_phases || 3}-phase strategy mirrors the customer journey, nurturing prospects from awareness through consideration to purchase—maximizing conversion rates and building sustainable growth.</p>
                </div>
            </div>

            <div class="section" style="margin-top: 3rem;">
                <h3 class="section-title">Confidence Level: High Success Probability</h3>
                <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); padding: 2rem; border-radius: 1rem; border-left: 4px solid #0ea5e9;">
                    <p style="margin-bottom: 1rem; color: #1f2937; font-weight: 600;">Based on proven methodologies and strategic framework</p>
                    <p style="color: #4b5563; line-height: 1.8;">
                        The beauty of this campaign lies in its progressive nature. Each phase builds on the success of the previous one, creating a snowball effect. 
                        By the time we reach the sales push in Phase ${campaign.number_of_phases || 3}, we're not pitching to cold audiences—we're converting warm leads who already know, trust, and love your brand.
                    </p>
                    <p style="color: #4b5563; line-height: 1.8; margin-top: 1rem;">
                        Moreover, the ${campaign.budget ? '$' + campaign.budget.toLocaleString() : '$2,000'} budget is strategically distributed to ensure consistent presence throughout all ${campaign.campaign_length || '8 weeks'}, 
                        with heavier allocation to the conversion-focused Phase ${campaign.number_of_phases || 3}. This approach maximizes ROI while building sustainable brand equity that continues paying dividends long after the campaign ends.
                    </p>
                </div>
            </div>
        </div>
        `;
    }

    generateCallToActionPage(campaign) {
        const startDate = campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : 'November 1, 2023';
        const budget = campaign.budget ? '$' + campaign.budget.toLocaleString() : '$2,000';
        const platforms = this.getPlatformsString(campaign);

        return `
        <div class="page">
            <div class="page-header">
                <div class="page-title">Ready to Transform Your Sales?</div>
            </div>

            <p style="font-size: 1.125rem; color: #4b5563; margin-bottom: 3rem; text-align: center; line-height: 1.8;">
                The ${campaign.name || 'campaign'} represents a unique opportunity to tap into a growing market of value-conscious consumers who refuse to pay full price for quality products. 
                With ${campaign.campaign_length || '8 weeks'} of strategic, phased content designed to build awareness, deepen engagement, and drive conversions, 
                we're positioned to deliver exceptional results that exceed your goals.
            </p>

            <div class="timeline">
                <div class="timeline-item">
                    <div class="timeline-title">Week 1-3: Launch</div>
                    <div class="timeline-description">Build awareness with stunning visual content reaching 10,000 users</div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-title">Week 4-6: Engage</div>
                    <div class="timeline-description">Deepen connections through interactive content and community building</div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-title">Week 7-8: Convert</div>
                    <div class="timeline-description">Drive sales with strategic offers and retargeting campaigns</div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-title">Beyond: Sustain</div>
                    <div class="timeline-description">Maintain momentum with loyal customer base and ongoing engagement</div>
                </div>
            </div>

            <p style="font-size: 1rem; color: #4b5563; margin: 2rem 0; text-align: center; line-height: 1.8;">
                This campaign doesn't just drive immediate sales—it builds a foundation for long-term success. By creating a community of engaged, 
                value-conscious shoppers who see your brand as their trusted source for quality deals, you're establishing recurring revenue streams and customer loyalty that 
                extends far beyond the ${campaign.campaign_length || 'holiday season'}. The strategies, content, and audience insights gained during these ${campaign.campaign_length || '8 weeks'} become valuable assets for future campaigns, 
                product launches, and business growth initiatives.
            </p>

            <div class="cta-section">
                <div class="cta-title">Campaign Launch Details</div>
                <div class="cta-description">Ready to discuss your campaign strategy and implementation details?</div>
                
                <div class="campaign-summary">
                    <div class="summary-grid">
                        <div class="summary-item">
                            <span>Campaign Start Date:</span>
                            <strong>${startDate}</strong>
                        </div>
                        <div class="summary-item">
                            <span>Total Investment:</span>
                            <strong>${budget}</strong>
                        </div>
                        <div class="summary-item">
                            <span>Expected Reach:</span>
                            <strong>20,000+ users</strong>
                        </div>
                        <div class="summary-item">
                            <span>Platform Focus:</span>
                            <strong>${platforms}</strong>
                        </div>
                        <div class="summary-item">
                            <span>Conversion Goal:</span>
                            <strong>10% increase</strong>
                        </div>
                        <div class="summary-item">
                            <span>Campaign Duration:</span>
                            <strong>${campaign.campaign_length || '8 weeks'}</strong>
                        </div>
                    </div>
                </div>
            </div>

            <p style="font-size: 1rem; color: #4b5563; margin-top: 2rem; text-align: center; line-height: 1.8; font-style: italic;">
                The time to act is now. Your target audience is scrolling through their feeds right now, looking for exactly what you offer. 
                With this comprehensive campaign strategy, you have everything needed to capture their attention, earn their trust, and convert their interest into sales. 
                Let's make these next ${campaign.campaign_length || '8 weeks'} the most profitable period in your business history. Are you ready to boost your sales and build a thriving community of savvy shoppers? Let's get started!
            </p>
        </div>
        `;
    }

    // Helper methods
    getTargetAudience(campaign) {
        try {
            if (campaign.target_audience) {
                if (typeof campaign.target_audience === 'string') {
                    return campaign.target_audience;
                }
                if (typeof campaign.target_audience === 'object') {
                    return JSON.stringify(campaign.target_audience).replace(/[{}"]/g, '').replace(/,/g, ', ');
                }
            }
        } catch (error) {
            console.log('Error parsing target_audience:', error);
        }
        return 'Value-conscious individual consumers actively searching for quality deals and smart shopping opportunities';
    }

    getPlatformsString(campaign) {
        if (campaign.platforms && Array.isArray(campaign.platforms) && campaign.platforms.length > 0) {
            return campaign.platforms.join(' and ');
        }
        return 'Facebook and Instagram';
    }

    getCampaignDuration(campaign) {
        if (campaign.start_date && campaign.end_date) {
            const start = new Date(campaign.start_date);
            const end = new Date(campaign.end_date);
            return `${campaign.campaign_length || '8 weeks'} of strategic content, from ${start.toLocaleDateString()} through ${end.toLocaleDateString()}`;
        }
        return `${campaign.campaign_length || '8 weeks'} of strategic content designed for maximum impact`;
    }
}

export default CampaignReportGenerator;