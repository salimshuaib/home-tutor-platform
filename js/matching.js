/**
 * Matching Engine — Delhi Private Tutors
 * 
 * Smart scoring algorithm that matches student tuition requests
 * with tutor profiles based on multiple weighted criteria.
 * 
 * Scoring Breakdown (max 120 points):
 *   Subject match   → +30
 *   Class match     → +25
 *   Location match  → +20
 *   Board match     → +10
 *   Mode match      → +10
 *   Experience >2yr → +10
 *   Verified tutor  → +15
 */

/* ━━━ SCORING WEIGHTS ━━━ */
const WEIGHTS = {
  subject:    30,
  class:      25,
  location:   20,
  board:      10,
  mode:       10,
  experience: 10,
  verified:   15,
};

const MAX_SCORE = Object.values(WEIGHTS).reduce((a, b) => a + b, 0); // 120

/* ━━━ CLASS RANGE MAPPING ━━━
 * Maps the student request class values to the tutor profile class range IDs.
 * Student form uses: "1st - 5th", "6th - 8th", "9th", "10th", "11th", "12th", "College", "Competitive Exams"
 * Tutor profile uses: "1-5", "6-8", "9-10", "11-12", "College", "Competitive"
 */
const CLASS_TO_RANGE = {
  '1st - 5th':        '1-5',
  '6th - 8th':        '6-8',
  '9th':              '9-10',
  '10th':             '9-10',
  '9th - 10th':       '9-10',
  '11th':             '11-12',
  '12th':             '11-12',
  '11th - 12th':      '11-12',
  'college':          'College',
  'competitive exams': 'Competitive',
  'competitive':      'Competitive',
};

/**
 * Normalize a class name to its range ID.
 * @param {string} className - e.g. "10th", "9th - 10th"
 * @returns {string|null} range ID like "9-10"
 */
function normalizeClassRange(className) {
  if (!className) return null;
  const key = className.trim().toLowerCase();
  return CLASS_TO_RANGE[key] || null;
}

/* ━━━ LOCATION MATCHING ━━━
 * Fuzzy match: checks if the request location contains the tutor's area or vice versa.
 * Also matches common Delhi zones like "South Delhi", "North Delhi" etc.
 */
const DELHI_ZONES = {
  'south delhi': ['lajpat nagar', 'saket', 'hauz khas', 'green park', 'defence colony', 'greater kailash', 'gk', 'cr park', 'malviya nagar', 'south ex', 'mehrauli', 'vasant kunj', 'dwarka', 'safdarjung', 'gulmohar park'],
  'north delhi': ['rohini', 'pitampura', 'model town', 'ashok vihar', 'shalimar bagh', 'civil lines', 'kamla nagar', 'hudson lane', 'gtb nagar', 'mukherjee nagar'],
  'east delhi': ['preet vihar', 'laxmi nagar', 'mayur vihar', 'ip extension', 'patparganj', 'pandav nagar', 'karkardooma', 'anand vihar', 'vasundhara enclave'],
  'west delhi': ['rajouri garden', 'janakpuri', 'tilak nagar', 'tagore garden', 'subhash nagar', 'hari nagar', 'paschim vihar', 'patel nagar', 'kirti nagar'],
  'central delhi': ['connaught place', 'cp', 'karol bagh', 'paharganj', 'rajender nagar', 'old delhi', 'chandni chowk'],
  'noida': ['sector', 'noida', 'greater noida'],
  'gurgaon': ['gurgaon', 'gurugram', 'dlf', 'sohna road', 'golf course road', 'manesar'],
};

/**
 * Check if two location strings are a match (fuzzy).
 * @param {string} requestLocation - e.g. "Lajpat Nagar, South Delhi"
 * @param {string} tutorArea - e.g. "Lajpat Nagar"
 * @param {string} tutorCity - e.g. "New Delhi"
 * @returns {boolean}
 */
function locationsMatch(requestLocation, tutorArea, tutorCity) {
  if (!requestLocation) return false;
  if (!tutorArea && !tutorCity) return false;

  const reqLower = requestLocation.toLowerCase().trim();
  const areaLower = (tutorArea || '').toLowerCase().trim();
  const cityLower = (tutorCity || '').toLowerCase().trim();

  // Direct substring match
  if (areaLower && reqLower.includes(areaLower)) return true;
  if (areaLower && reqLower.length >= 4 && areaLower.includes(reqLower)) return true;

  // Check if both are in the same Delhi zone
  for (const [zone, areas] of Object.entries(DELHI_ZONES)) {
    const reqInZone = reqLower.includes(zone) || areas.some(a => reqLower.includes(a));
    const tutorInZone = areaLower.includes(zone) || areas.some(a => areaLower.includes(a)) || cityLower.includes(zone);
    if (reqInZone && tutorInZone) return true;
  }

  // City-level match (both in Delhi/Noida/Gurgaon)
  if (cityLower && reqLower.includes(cityLower)) return true;

  return false;
}

/* ━━━ MODE MATCHING ━━━ */
/**
 * Check if teaching mode is compatible.
 * @param {string} requestMode - "Home Tuition", "Online", "Both (Flexible)"
 * @param {string[]} tutorModes - ["Home Tuition", "Online"]
 * @returns {boolean}
 */
function modesMatch(requestMode, tutorModes) {
  if (!requestMode || !tutorModes || tutorModes.length === 0) return false;

  const reqLower = (requestMode || '').toLowerCase();

  // "Both (Flexible)" matches everything
  if (reqLower.includes('both') || reqLower.includes('flexible')) return true;

  // Check if tutor offers the requested mode
  return tutorModes.some(m => {
    const mLower = m.toLowerCase();
    if (reqLower.includes('home') && mLower.includes('home')) return true;
    if (reqLower.includes('online') && mLower.includes('online')) return true;
    return false;
  });
}

/* ━━━ CORE SCORING FUNCTION ━━━ */

/**
 * Calculate a match score between a tutor profile and a student request.
 * 
 * @param {Object} tutor - Tutor profile from Firestore `users` collection
 *   { subjects:[], classes:[], boards:[], mode:[], area, city, experience, status }
 * @param {Object} request - Student request from Firestore `requests` collection
 *   { subject, className, location, board, mode, budget }
 * @returns {{ score: number, percentage: number, breakdown: Object }}
 */
function calculateScore(tutor, request) {
  const breakdown = {
    subject:    0,
    class:      0,
    location:   0,
    board:      0,
    mode:       0,
    experience: 0,
    verified:   0,
  };

  // ── Subject Match (+30) ──
  if (request.subject && tutor.subjects && tutor.subjects.length > 0) {
    const reqSubject = request.subject.toLowerCase().trim();
    // "All Subjects" always matches
    if (reqSubject === 'all subjects') {
      breakdown.subject = WEIGHTS.subject;
    } else {
      const match = tutor.subjects.some(s => s.toLowerCase().trim() === reqSubject);
      if (match) breakdown.subject = WEIGHTS.subject;
    }
  }

  // ── Class Match (+25) ──
  if (request.className && tutor.classes && tutor.classes.length > 0) {
    const reqRange = normalizeClassRange(request.className);
    if (reqRange) {
      const match = tutor.classes.some(c => c === reqRange);
      if (match) breakdown.class = WEIGHTS.class;
    }
  }

  // ── Location Match (+20) ──
  if (locationsMatch(request.location, tutor.area, tutor.city)) {
    breakdown.location = WEIGHTS.location;
  }

  // ── Board Match (+10) ──
  if (request.board && tutor.boards && tutor.boards.length > 0) {
    const reqBoard = request.board.toLowerCase().trim();
    const match = tutor.boards.some(b => b.toLowerCase().trim() === reqBoard);
    if (match) breakdown.board = WEIGHTS.board;
  }

  // ── Mode Match (+10) ──
  if (modesMatch(request.mode, tutor.mode)) {
    breakdown.mode = WEIGHTS.mode;
  }

  // ── Experience Bonus (+10) ──
  if (tutor.experience && Number(tutor.experience) > 2) {
    breakdown.experience = WEIGHTS.experience;
  }

  // ── Verified/Approved Bonus (+15) ──
  if (tutor.status === 'approved') {
    breakdown.verified = WEIGHTS.verified;
  }

  const score = Object.values(breakdown).reduce((a, b) => a + b, 0);
  const percentage = Math.round((score / MAX_SCORE) * 100);

  return { score, percentage, breakdown };
}

/* ━━━ BATCH MATCHING FUNCTIONS ━━━ */

/**
 * Match a tutor's profile against all open requests and return scored results.
 * Used in the tutor dashboard to show "Matched Tuitions".
 * 
 * @param {Object} tutorProfile - Tutor's profile data
 * @param {Object[]} requests - Array of student requests
 * @param {string[]} appliedRequestIds - IDs of requests the tutor already applied to
 * @param {number} minScore - Minimum score threshold (default: 20)
 * @param {number} maxResults - Maximum results to return (default: 50)
 * @returns {{ id, ...requestData, matchScore, matchPercentage, matchBreakdown }[]}
 */
function matchAndScoreRequests(tutorProfile, requests, appliedRequestIds = [], minScore = 20, maxResults = 50) {
  const scored = [];

  for (const req of requests) {
    // Skip already-applied requests
    if (appliedRequestIds.includes(req.id)) continue;

    const { score, percentage, breakdown } = calculateScore(tutorProfile, req);

    if (score >= minScore) {
      scored.push({
        ...req,
        matchScore: score,
        matchPercentage: percentage,
        matchBreakdown: breakdown,
      });
    }
  }

  // Sort by score descending, then by createdAt descending
  scored.sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    // Fall back to most recent first
    const aTime = a.createdAt?.seconds || 0;
    const bTime = b.createdAt?.seconds || 0;
    return bTime - aTime;
  });

  return scored.slice(0, maxResults);
}

/**
 * Match a student request against all tutors and return scored results.
 * Can be used for admin analytics or future "matched tutors" view on student side.
 * 
 * @param {Object} request - Student request data
 * @param {Object[]} tutors - Array of tutor profiles
 * @param {number} minScore - Minimum score threshold
 * @param {number} maxResults - Maximum results
 * @returns {{ id, ...tutorData, matchScore, matchPercentage, matchBreakdown }[]}
 */
function matchAndScoreTutors(request, tutors, minScore = 20, maxResults = 10) {
  const scored = [];

  for (const tutor of tutors) {
    // Only match approved tutors
    if (tutor.status !== 'approved') continue;

    const { score, percentage, breakdown } = calculateScore(tutor, request);

    if (score >= minScore) {
      scored.push({
        ...tutor,
        matchScore: score,
        matchPercentage: percentage,
        matchBreakdown: breakdown,
      });
    }
  }

  scored.sort((a, b) => b.matchScore - a.matchScore);
  return scored.slice(0, maxResults);
}

/**
 * Get a color class based on match percentage.
 * @param {number} pct - Match percentage (0-100)
 * @returns {string} CSS class suffix
 */
function getMatchColor(pct) {
  if (pct >= 75) return 'excellent';
  if (pct >= 50) return 'good';
  if (pct >= 30) return 'fair';
  return 'low';
}

/* ━━━ EXPORTS ━━━ */
export {
  calculateScore,
  matchAndScoreRequests,
  matchAndScoreTutors,
  getMatchColor,
  normalizeClassRange,
  locationsMatch,
  modesMatch,
  WEIGHTS,
  MAX_SCORE,
};
