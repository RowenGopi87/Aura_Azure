-- =============================================
-- Clean up duplicate and excess data
-- Keep only 1-2 items per business brief
-- =============================================

-- First, let's see what we have
SELECT 'Current data counts:' as Status;
SELECT 'Business Briefs:' as Type, COUNT(*) as Count FROM business_briefs
UNION ALL
SELECT 'Initiatives:', COUNT(*) FROM initiatives  
UNION ALL
SELECT 'Features:', COUNT(*) FROM features
UNION ALL
SELECT 'Epics:', COUNT(*) FROM epics
UNION ALL
SELECT 'Stories:', COUNT(*) FROM stories;

-- Clean up initiatives - keep only 1 per business brief
DELETE i1 FROM initiatives i1
INNER JOIN initiatives i2 
WHERE i1.business_brief_id = i2.business_brief_id 
AND i1.created_at > i2.created_at;

-- Clean up features - keep only 1 per initiative
DELETE f1 FROM features f1
INNER JOIN features f2 
WHERE f1.initiative_id = f2.initiative_id 
AND f1.created_at > f2.created_at;

-- Clean up epics - keep only 1 per feature
DELETE e1 FROM epics e1
INNER JOIN epics e2 
WHERE e1.feature_id = e2.feature_id 
AND e1.created_at > e2.created_at;

-- Clean up stories - keep only 1 per epic
DELETE s1 FROM stories s1
INNER JOIN stories s2 
WHERE s1.epic_id = s2.epic_id 
AND s1.created_at > s2.created_at;

-- Final counts
SELECT 'After cleanup:' as Status;
SELECT 'Business Briefs:' as Type, COUNT(*) as Count FROM business_briefs
UNION ALL
SELECT 'Initiatives:', COUNT(*) FROM initiatives  
UNION ALL
SELECT 'Features:', COUNT(*) FROM features
UNION ALL
SELECT 'Epics:', COUNT(*) FROM epics
UNION ALL
SELECT 'Stories:', COUNT(*) FROM stories;

SELECT 'Database cleanup completed!' as Status;
