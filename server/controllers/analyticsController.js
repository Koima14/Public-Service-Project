const { db } = require('../db/database');

/**
 * Get comprehensive analytics summary
 * GET /api/analytics/summary
 */
exports.getAnalyticsSummary = (req, res) => {
  try {
    // 1. High-level metric counts
    const totalRequests = db.prepare('SELECT COUNT(*) as count FROM service_requests').get().count;
    const pendingCount = db.prepare("SELECT COUNT(*) as count FROM service_requests WHERE status = 'Pending'").get().count;
    const inProgressCount = db.prepare("SELECT COUNT(*) as count FROM service_requests WHERE status = 'In Progress'").get().count;
    const resolvedCount = db.prepare("SELECT COUNT(*) as count FROM service_requests WHERE status = 'Resolved'").get().count;
    const rejectedCount = db.prepare("SELECT COUNT(*) as count FROM service_requests WHERE status = 'Rejected'").get().count;

    const openCount = pendingCount + inProgressCount;
    const closedCount = resolvedCount + rejectedCount;
    const resolutionRate = totalRequests > 0 ? Math.round((resolvedCount / totalRequests) * 100) : 0;

    // 2. Critical & High priority pending/in-progress count
    const criticalOpenCount = db.prepare(`
      SELECT COUNT(*) as count FROM service_requests
      WHERE priority IN ('Critical', 'High') AND status IN ('Pending', 'In Progress')
    `).get().count;

    // 3. Average citizen satisfaction rating
    const ratingStats = db.prepare(`
      SELECT 
        AVG(rating) as avg_rating,
        COUNT(*) as total_feedback
      FROM feedback
    `).get();

    const avgRating = ratingStats.avg_rating ? Number(ratingStats.avg_rating.toFixed(1)) : 0;
    const totalFeedback = ratingStats.total_feedback || 0;

    // 4. Breakdown by Category (with open vs resolved counts)
    const categoryStats = db.prepare(`
      SELECT 
        category,
        COUNT(*) as total,
        SUM(CASE WHEN status IN ('Pending', 'In Progress') THEN 1 ELSE 0 END) as open_cases,
        SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved_cases
      FROM service_requests
      GROUP BY category
      ORDER BY total DESC
    `).all();

    // 5. Breakdown by Priority
    const priorityStats = db.prepare(`
      SELECT priority, COUNT(*) as count
      FROM service_requests
      GROUP BY priority
    `).all();

    // 6. Breakdown by County
    const countyStats = db.prepare(`
      SELECT county, COUNT(*) as count
      FROM service_requests
      GROUP BY county
      ORDER BY count DESC
      LIMIT 6
    `).all();

    // 7. Recent 5 status changes / activity log
    const recentActivity = db.prepare(`
      SELECT 
        rh.id,
        rh.status,
        rh.changed_by,
        rh.notes,
        rh.created_at,
        sr.reference_no,
        sr.category
      FROM request_history rh
      JOIN service_requests sr ON sr.id = rh.request_id
      ORDER BY rh.created_at DESC
      LIMIT 6
    `).all();

    return res.json({
      success: true,
      analytics: {
        summary: {
          totalRequests,
          openCases: openCount,
          pending: pendingCount,
          inProgress: inProgressCount,
          resolvedCases: resolvedCount,
          rejected: rejectedCount,
          resolutionRate,
          criticalOpen: criticalOpenCount,
          avgRating,
          totalFeedback
        },
        categoryBreakdown: categoryStats,
        priorityBreakdown: priorityStats,
        countyBreakdown: countyStats,
        recentActivity
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return res.status(500).json({ success: false, message: 'Failed to compute analytics.' });
  }
};
