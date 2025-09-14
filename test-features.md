# QuickPoll Feature Testing Checklist

## 1. Deadline/Expiry Settings
- [x] Default 7-day expiry is applied when custom expiry is OFF
- [x] Custom expiry toggle shows day/hour input fields
- [x] Custom expiry values are correctly saved to database
- [x] Expiry time is displayed correctly on VotePage and ResultsPage
- [x] Expired polls redirect to results page automatically

## 2. Single/Multiple Choice Selection
- [x] Toggle switch for single/multiple choice in CreatePoll
- [x] VotePage shows radio buttons for single choice
- [x] VotePage shows checkboxes for multiple choice
- [x] Multiple selections can be submitted successfully
- [x] Database correctly stores multiple votes per user
- [x] Results page shows correct counts for multiple choice polls

## 3. Anonymous/Named Voting
- [x] Toggle switch for anonymous/named voting in CreatePoll
- [x] VotePage shows name input field for named polls
- [x] Name is required for non-anonymous polls
- [x] Voter names are saved to database
- [x] ResultsPage shows voter list for non-anonymous polls
- [x] ResultsPage hides voter list for anonymous polls

## 4. UI Indicators
- [x] Poll settings (single/multiple, anonymous/named) shown on VotePage
- [x] Poll settings shown on ResultsPage
- [x] Real-time update indicator on ResultsPage
- [x] Leading option highlighted in results

## 5. Duplicate Vote Prevention
- [x] localStorage-based voter ID persists across sessions
- [x] Users cannot vote twice on the same poll
- [x] After voting, users are redirected to results page
- [x] Attempting to access vote page after voting redirects to results

## Test Scenarios

### Scenario 1: Anonymous Single Choice Poll (Default)
1. Create poll with default settings
2. Vote once → Should redirect to results
3. Try to vote again → Should redirect to results
4. Check results → No voter names shown

### Scenario 2: Named Multiple Choice Poll
1. Create poll with:
   - Multiple choice: ON
   - Anonymous: OFF
2. Vote with name and multiple options
3. Check results → Voter names with selected options shown

### Scenario 3: Custom Expiry Poll
1. Create poll with custom expiry (e.g., 1 hour)
2. Check expiry time display
3. After expiry, accessing vote page should redirect to results

## Database Verification

Check these columns exist and work:
- `polls.allow_multiple` (boolean)
- `polls.is_anonymous` (boolean)
- `polls.custom_expires_at` (boolean)
- `votes.voter_name` (text, nullable)
- `votes.voter_id` (text, not null)

## Edge Cases
- [x] Empty voter name validation for named polls
- [x] No option selected validation
- [x] Expired poll access handling
- [x] Real-time updates with multiple users