export const INITIAL_PROJECTS = [
  { id: 'proj-1', name: 'Nebula OS v3.0 Launch', color: '#8B5CF6', description: 'Next generation cloud operating system user dashboard and micro-kernel API release.' },
  { id: 'proj-2', name: 'Mobile App Redesign', color: '#06B6D4', description: 'Complete UI/UX overhaul of iOS and Android mobile workspace apps.' },
  { id: 'proj-3', name: 'AI Copilot Engine', color: '#10B981', description: 'Integration of LLM auto-suggestions and context-aware task breakdown features.' },
];

export const INITIAL_TASKS = [
  {
    id: 'TASK-101',
    projectId: 'proj-1',
    title: 'Architect Glassmorphism UI Component Library',
    description: 'Design and standardize modern dark-mode design system tokens, typography scales, dynamic glass backdrops, and accessible color variants.',
    status: 'in_progress',
    priority: 'Urgent',
    tags: ['Frontend', 'Design'],
    assignee: { name: 'Elena Rostova', avatar: 'ER', color: '#8B5CF6' },
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    estimatedHours: 12,
    loggedHours: 7.5,
    subtasks: [
      { id: 'st-1', text: 'Define CSS variables for HSL theme tokens', completed: true },
      { id: 'st-2', text: 'Build responsive Kanban card layout components', completed: true },
      { id: 'st-3', text: 'Implement micro-animations & smooth tab transitions', completed: false }
    ],
    notes: 'Ensure backdrop-filter webkit prefix compatibility across WebKit browsers.',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'TASK-102',
    projectId: 'proj-3',
    title: 'Train Smart Task NLP Command Parser',
    description: 'Implement regex and string pattern recognition for inline metadata parsing like date (#tomorrow), tags (#frontend), priorities (!urgent), and assignees (@alex).',
    status: 'todo',
    priority: 'High',
    tags: ['AI Engine', 'Backend'],
    assignee: { name: 'Marcus Chen', avatar: 'MC', color: '#10B981' },
    dueDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
    estimatedHours: 8,
    loggedHours: 1,
    subtasks: [
      { id: 'st-4', text: 'Write pattern matching engine for inline hashtags', completed: true },
      { id: 'st-5', text: 'Integrate quick task creation keyboard shortcut (Cmd+K)', completed: false }
    ],
    notes: 'Target response time < 50ms for instant preview rendering.',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'TASK-103',
    projectId: 'proj-1',
    title: 'Web Audio Ambient Soundscape Generator',
    description: 'Construct native Web Audio API oscillators and brownian noise synth generators for focus music (Rainfall, Deep Cosmic, Lofi Chill).',
    status: 'in_review',
    priority: 'Medium',
    tags: ['Audio', 'Frontend'],
    assignee: { name: 'Sophia Vance', avatar: 'SV', color: '#06B6D4' },
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    estimatedHours: 6,
    loggedHours: 5.8,
    subtasks: [
      { id: 'st-6', text: 'Pink noise & white noise synth node chain', completed: true },
      { id: 'st-7', text: 'Binaural beats & rain drop sound synthesis', completed: true }
    ],
    notes: 'No external audio MP3 dependencies needed - generated entirely client-side!',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 'TASK-104',
    projectId: 'proj-2',
    title: 'Mobile Touch Drag & Drop & Haptic Feedback',
    description: 'Ensure Kanban board card reordering works smoothly on iPad, mobile touch screens, and desktop pointer events with drag preview ghosts.',
    status: 'done',
    priority: 'High',
    tags: ['Mobile', 'UX'],
    assignee: { name: 'Alex Rivera', avatar: 'AR', color: '#F59E0B' },
    dueDate: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0],
    estimatedHours: 10,
    loggedHours: 9.5,
    subtasks: [
      { id: 'st-8', text: 'Touch end state position calculator', completed: true },
      { id: 'st-9', text: 'Confetti celebration trigger on task completion', completed: true }
    ],
    notes: 'Tested on Safari iOS 17 and Chrome Android.',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString()
  },
  {
    id: 'TASK-105',
    projectId: 'proj-1',
    title: 'Database Index & Query Optimization',
    description: 'Optimize SQLite and IndexedDB task indexes to support instantaneous client-side searching across 10,000+ workspace items.',
    status: 'backlog',
    priority: 'Low',
    tags: ['Database', 'Performance'],
    assignee: { name: 'David Kim', avatar: 'DK', color: '#EC4899' },
    dueDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    estimatedHours: 16,
    loggedHours: 0,
    subtasks: [
      { id: 'st-10', text: 'Benchmark full-text search index speeds', completed: false }
    ],
    notes: 'Evaluate WebAssembly SQLite vs native IndexedDB performance.',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    id: 'TASK-106',
    projectId: 'proj-2',
    title: 'Dark & Light Mode Contrast Audit',
    description: 'Verify WCAG AA color accessibility for all text overlays, badges, icons, and status indicators across dark themes.',
    status: 'todo',
    priority: 'Medium',
    tags: ['Design', 'Accessibility'],
    assignee: { name: 'Elena Rostova', avatar: 'ER', color: '#8B5CF6' },
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    estimatedHours: 4,
    loggedHours: 1.2,
    subtasks: [
      { id: 'st-11', text: 'Run Automated Axe Accessibility Scan', completed: true },
      { id: 'st-12', text: 'Fix contrast ratios on muted priority tags', completed: false }
    ],
    notes: 'Aim for 4.5:1 minimum contrast on muted text labels.',
    createdAt: new Date(Date.now()).toISOString()
  }
];

export const INITIAL_DOCS = [
  {
    id: 'doc-1',
    title: '⚡ APEX Pulse Platform Architecture',
    category: 'Architecture',
    lastModified: new Date().toISOString(),
    content: `# APEX Pulse Platform Architecture & System Spec

## Executive Summary
APEX Pulse is a state-of-the-art, high-performance workspace productivity suite built for modern product engineering teams. It unifies project tracking, interactive Kanban workflows, Pomodoro focus soundscapes, visual Gantt timelines, and real-time document specs in one cohesive obsidian interface.

## Core Modules
1. **Interactive Kanban Board**: Dynamic HTML5 drag-and-drop workflow with column velocity tracking.
2. **Focus & Soundscape Generator**: Native Web Audio API binaural beats and ambient rainfall synthesizers.
3. **Analytics Engine**: Real-time completion rates, burn-down calculations, and velocity metrics.
4. **Interactive Docs Editor**: Instant Markdown rendering with live local storage persistence.

---
*Created with APEX Pulse Engine v3.2*`
  },
  {
    id: 'doc-2',
    title: '🚀 Q4 Product Launch Roadmap',
    category: 'Roadmap',
    lastModified: new Date(Date.now() - 86400000).toISOString(),
    content: `# Q4 Product Launch Milestones & Goals

### Week 1 - 2: Foundation & Glassmorphism Design Token System
- [x] Establish HSL token system for obsidian dark mode & neon themes
- [x] Implement smooth tab transitions and keyboard shortcut engine (Cmd+K)
- [ ] Finalize responsive grid layouts across desktop and mobile devices

### Week 3 - 4: AI Smart Parser & Focus Timer Integration
- [x] Web Audio binaural beats generator
- [ ] Natural Language command bar parsing algorithm
- [ ] Automated weekly velocity summary report generator`
  }
];

export const TEAM_MEMBERS = [
  { name: 'Elena Rostova', avatar: 'ER', color: '#8B5CF6', role: 'Lead Product Designer' },
  { name: 'Marcus Chen', avatar: 'MC', color: '#10B981', role: 'Senior AI Engineer' },
  { name: 'Sophia Vance', avatar: 'SV', color: '#06B6D4', role: 'Fullstack Developer' },
  { name: 'Alex Rivera', avatar: 'AR', color: '#F59E0B', role: 'Mobile UX Lead' },
  { name: 'David Kim', avatar: 'DK', color: '#EC4899', role: 'DevOps & Systems Architect' }
];
