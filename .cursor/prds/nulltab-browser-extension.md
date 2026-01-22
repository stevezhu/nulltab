# NullTab - Next-Generation Tab Manager

## Product Requirements Document

**Version:** 1.0  
**Date:** October 29, 2025  
**Status:** Draft

---

## Executive Summary

NullTab reimagines web browsing by replacing the traditional tab management model with an intelligent, category-based system that automatically organizes, prioritizes, and surfaces the content users need. Instead of manually managing dozens of tabs across multiple windows, users work with a single, organized view where tabs are automatically categorized, prioritized by importance, and easily accessible through AI-powered search.

---

## Problem Statement

### Current Pain Points

1. **Tab Overload**: Users accumulate dozens or hundreds of tabs that become impossible to manage
2. **Manual Organization**: Sorting tabs into windows by category is tedious and time-consuming
3. **Information Loss**: Important tabs get lost in the clutter
4. **Primitive Bookmarking**: Bookmarks are a static solution to a dynamic problem
5. **Cognitive Overhead**: Mental burden of deciding which tabs to keep open vs. close
6. **No Built-in Persistence**: Users rely on extensions like "OneTab" just to save their browsing state

### User Insight

> "I moved a YouTube tab to a window with more YouTube tabs. Why can't this happen automatically? Why do I keep using OneTab to save my tabs? Why isn't this just built into browsing?"

---

## Vision

**Tabs are an antiquated way of browsing.** NullTab creates a flexible flow of tabs that you can open and close at will, organized automatically by category and importance. It's more steps than traditional browsing, but way more organized and easier to comprehend.

---

## Core Concepts

### 1. Window-Category Binding

- Each window is bound to a specific category
- Drag tabs between windows to reassign categories
- Single active tab per window (inspired by focused browsing)

### 2. Automatic Categorization

- Automated tab grouping using k-means clustering algorithms
- Unlabeled groups that learn from user behavior
- Smart categorization based on domain, content, and usage patterns

### 3. Intelligent Prioritization

- **Multiple Saves = Higher Importance**: Saving a tab multiple times increases its priority
- **Domain Importance**: PageRank-inspired algorithm for domain reputation
- **Recency Score**: Last visited time affects ranking
- **Stack Ranking**: Clear hierarchy of tab importance

### 4. Smart Persistence

- All tabs automatically saved and cached
- Differentiate between "pinned" (important) and "save for later" (reference)
- Users trust the system to help them find what they need later

---

## Features

### Phase 1: Core Tab Management

#### 1.1 Tab Collection & Storage

- [x] Automatic tab saving on creation
- [x] Persistent tab cache (survives browser restarts)
- [x] Tab metadata capture:
  - Title, URL, favicon
  - Timestamp (created, last visited)
  - Visit count
  - Category assignment
  - Importance score

#### 1.2 Category Management

- [ ] Automatic category detection
- [ ] Manual category creation/editing
- [ ] Drag-and-drop category reassignment
- [ ] Visual category indicators

#### 1.3 Tab Visualization

- [ ] List view (default)
- [ ] Grid view
- [ ] Timeline view (sort by last visited)
- [ ] Visual indicators:
  - Color gradient for recency
  - Bar chart for visit frequency
  - Graph showing visit history over time

#### 1.4 Stale Tab Management

- [ ] Automatic staleness detection based on date
- [ ] Configurable staleness thresholds
- [ ] Archive stale tabs automatically
- [ ] Quick restore from archive

### Phase 2: Power User Features

#### 2.1 Hotkeys

- [ ] `Cmd/Ctrl + S`: Save current tab for later
- [ ] `Cmd/Ctrl + Shift + S`: Pin current tab
- [ ] `Cmd/Ctrl + K`: Quick search tabs
- [ ] `Cmd/Ctrl + Shift + K`: AI chat interface
- [ ] Customizable hotkey configuration

#### 2.2 Advanced Views

- [ ] Detailed metadata view for power users:
  - Full visit history
  - Related tabs
  - Domain statistics
  - Custom tags/notes
- [ ] URL grouping by base domain
- [ ] Filtering and sorting options:
  - By category
  - By date range
  - By importance score
  - By domain

#### 2.3 Scripting Support

- [ ] JavaScript/TypeScript scripting engine
- [ ] Custom automation rules
- [ ] User-defined filters and categorizers
- [ ] Plugin/extension system

### Phase 3: Intelligence Layer

#### 3.1 AI-Powered Search

- [ ] Natural language search
- [ ] Semantic similarity matching
- [ ] Context-aware suggestions
- [ ] "Find tabs related to X"

#### 3.2 AI Chat Interface

- [ ] Chat to find specific tabs
- [ ] Ask AI to organize tabs
- [ ] Setup custom filtering with conversational UI
- [ ] Tab recommendations based on current context

#### 3.3 Smart Algorithms

- [ ] k-means clustering for auto-categorization
- [ ] PageRank-inspired domain scoring
- [ ] Collaborative filtering (if multi-user)
- [ ] Behavioral learning from user actions

### Phase 4: Sync & Collaboration

#### 4.1 Cross-Device Sync

- [ ] Cloud sync via user account
- [ ] Conflict resolution UI
- [ ] Merge conflict visualization
- [ ] Manual conflict resolution tools

#### 4.2 Import/Export

- [ ] Import from bookmarks
- [ ] Import from OneTab/similar extensions
- [ ] Export to various formats (JSON, HTML, CSV)

### Phase 5: New Tab Experience

#### 5.1 Replace New Tab Page

- [ ] Custom new tab page showing:
  - Recent tabs
  - Pinned tabs
  - Suggested tabs based on time of day
  - Quick category navigation
  - AI search box

#### 5.2 Bookmark Replacement

- [ ] Migrate existing bookmarks
- [ ] Enhanced bookmark features:
  - Automatic importance detection
  - Smart folders = categories
  - Live preview
  - Metadata enrichment

---

## User Experience

### Primary User Flow

1. **User opens a new tab** → Automatically saved to collection
2. **System analyzes content** → Assigns preliminary category
3. **User continues browsing** → NullTab learns patterns
4. **User wants to find a tab** → Uses AI search or category view
5. **Tab becomes stale** → Automatically archived but searchable
6. **User saves tab multiple times** → Importance score increases

### Window Management Flow

1. **User creates category window** → Window bound to category (e.g., "Work", "Research")
2. **Tabs open in that window** → Auto-assigned to category
3. **User drags tab to different window** → Category reassigned
4. **Only one active tab per window** → Reduces clutter, increases focus

### Save for Later Flow

1. **User on interesting page** → Presses hotkey (Cmd+S)
2. **Tab added to "Later" category** → Can close tab without worry
3. **System tracks importance** → Multiple saves = higher priority
4. **User searches later** → Easily finds saved content
5. **Trust builds over time** → User confident in tab recovery

---

## Technical Architecture

### Browser Extension Components

#### 1. Background Service Worker

- Tab event listeners (created, updated, removed)
- Periodic sync and cleanup
- AI model integration
- Category computation engine

#### 2. Content Scripts

- Page metadata extraction
- DOM analysis for categorization
- Rich preview generation

#### 3. Popup UI

- Quick search interface
- Recent tabs display
- Category quick-switcher
- AI chat widget

#### 4. New Tab Override Page

- Full tab management interface
- Category management
- Advanced search and filtering
- Settings and configuration

#### 5. Options Page

- Preferences and settings
- Hotkey customization
- Scripting editor
- Import/export tools

### Data Storage

#### Local Storage (IndexedDB)

```typescript
interface Tab {
  id: string;
  url: string;
  title: string;
  favIconUrl?: string;
  categoryId: string;
  importanceScore: number;
  saveCount: number;
  visitCount: number;
  createdAt: Date;
  lastVisitedAt: Date;
  metadata: {
    domain: string;
    pageRank?: number;
    keywords?: string[];
    description?: string;
  };
  isPinned: boolean;
  isArchived: boolean;
}

interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  autoGenerated: boolean;
  windowId?: number;
}

interface Visit {
  tabId: string;
  timestamp: Date;
  duration?: number;
}
```

#### Cloud Sync (Phase 4)

- Encrypted tab data
- Conflict resolution metadata
- User preferences
- Sync timestamps

### AI Integration

#### Models

- **Categorization**: Fine-tuned text classifier
- **Search**: Semantic embedding model (e.g., Sentence-BERT)
- **Chat**: LLM integration (OpenAI API or local model)

#### Processing Pipeline

1. Extract text from page (title, meta, headings)
2. Generate embeddings
3. Cluster similar tabs
4. Assign categories
5. Calculate importance scores

---

## Success Metrics

### User Engagement

- Daily active users (DAU)
- Tab saves per user per day
- Search queries per user per day
- Retention rate (7-day, 30-day)

### Product Performance

- Average tabs managed per user
- Category accuracy (user corrections as proxy)
- Search result click-through rate
- Time to find specific tab

### User Satisfaction

- Extension rating
- Review sentiment
- User-submitted feedback
- Feature request frequency

### Technical Metrics

- Search latency (< 100ms target)
- Categorization accuracy (> 80% target)
- Sync success rate (> 99% target)
- Extension memory usage (< 100MB target)

---

## User Acquisition Strategy

### 1. In-App Growth

- Prompt happy users for reviews (detect high engagement)
- Referral system with incentives
- Social sharing of category setups

### 2. Content Marketing

- Blog posts on productivity
- Comparison with traditional tab management
- Case studies from power users

### 3. Community

- Discord/Reddit community
- User-generated scripts/plugins
- Feature voting platform

---

## Risks & Mitigations

### Risk 1: User Adoption Curve

**Risk**: Paradigm shift may be too different from traditional browsing  
**Mitigation**:

- Gradual onboarding with tutorials
- Hybrid mode supporting traditional tabs
- Clear value demonstration in first session

### Risk 2: Performance at Scale

**Risk**: Extension may slow down with thousands of saved tabs  
**Mitigation**:

- Lazy loading and pagination
- Aggressive archival of stale tabs
- Efficient indexing and search algorithms

### Risk 3: Browser Limitations

**Risk**: Chrome doesn't support closing tabs while keeping them cached  
**Mitigation**:

- Use tab groups with collapsed state
- Implement custom tab suspension
- Work within browser constraints creatively

### Risk 4: Privacy Concerns

**Risk**: Users may be wary of tab content analysis  
**Mitigation**:

- Local-first processing
- Transparent privacy policy
- Opt-in cloud features
- Open source core functionality

### Risk 5: AI Accuracy

**Risk**: Poor categorization frustrates users  
**Mitigation**:

- Easy manual override
- Learning from user corrections
- Conservative initial categorization
- Clear confidence indicators

---

## Development Roadmap

### Q1 2026: MVP (Phase 1)

- [ ] Core tab collection and storage
- [ ] Basic categorization (manual + simple auto)
- [ ] List view with search
- [ ] Save for later functionality
- [ ] Chrome extension published

### Q2 2026: Power Features (Phase 2)

- [ ] Hotkey system
- [ ] Advanced views and filtering
- [ ] Detailed metadata views
- [ ] Stale tab management
- [ ] Firefox support

### Q3 2026: Intelligence (Phase 3)

- [ ] AI-powered categorization
- [ ] Semantic search
- [ ] Chat interface
- [ ] Importance scoring refinement
- [ ] Usage analytics dashboard

### Q4 2026: Sync & Polish (Phase 4-5)

- [ ] Cloud sync with conflict resolution
- [ ] New tab page replacement
- [ ] Bookmark migration tools
- [ ] Scripting support (beta)
- [ ] Mobile companion app (view only)

---

## Open Questions

1. **Single Window vs. Multi-Window**: PRD mentions both "single window with most tabs" and "each window bound to category" - need to clarify the model
   - **Option A**: Single window, multiple category views
   - **Option B**: Multiple category windows, one tab visible per window
   - **Recommendation**: Start with Option A (simpler), add Option B later

2. **AI Model Hosting**: Local vs. Cloud?
   - **Trade-off**: Privacy/offline vs. accuracy/features
   - **Recommendation**: Hybrid - basic local, advanced cloud (opt-in)

3. **Monetization**: Free vs. Freemium vs. Paid?
   - **Recommendation**: Freemium - free core, paid sync/AI features

4. **Browser Support**: Chrome-first vs. Multi-browser from start?
   - **Recommendation**: Chrome-first (largest market), Firefox next

5. **Data Retention**: How long to keep archived tabs?
   - **Recommendation**: Configurable, default 90 days for archived, unlimited for saved

---

## Appendix

### Competitive Analysis

#### OneTab

- **Strengths**: Simple, fast, popular
- **Weaknesses**: No categorization, basic search, no intelligence
- **Differentiation**: NullTab adds AI, categories, importance scoring

#### Tab Grouping (Chrome Native)

- **Strengths**: Built-in, simple
- **Weaknesses**: Manual only, no persistence, no search
- **Differentiation**: NullTab automates and adds intelligence

#### Toby / Workona

- **Strengths**: Category-based, team features
- **Weaknesses**: Manual management, workspace-focused
- **Differentiation**: NullTab focuses on automation and AI

### User Research Insights

_To be conducted_

- User interviews with tab hoarders
- Survey of current tab management pain points
- Usability testing of prototype
- A/B testing of categorization UI

### Technical References

- [Chrome Extension Hotkeys Documentation](https://developer.chrome.com/docs/extensions/reference/commands/)
- [Chrome Tab Groups API](https://developer.chrome.com/docs/extensions/reference/tabGroups/)
- [k-means Clustering Algorithm](https://en.wikipedia.org/wiki/K-means_clustering)
- [PageRank Algorithm](https://en.wikipedia.org/wiki/PageRank)
- [Semantic Search with Embeddings](https://www.sbert.net/)

---

## Changelog

- **v1.0** (2025-10-29): Initial PRD draft based on product vision
