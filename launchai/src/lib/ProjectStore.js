/**
 * ProjectStore.js
 * Manages project persistence in localStorage for LaunchAI.
 */

const STORAGE_KEY = 'launchai_projects'

const DEMO_PROJECTS = [
  {
    id: 1,
    name: 'Invoice Analyzer',
    desc: 'Extract & categorize invoice data using AI',
    status: 'live',
    calls: 342,
    updated: '2h ago',
    tag: 'Finance',
    components: [
      { id: 1, type: 'text-input', label: 'Invoice Number' },
      { id: 2, type: 'textarea',   label: 'Invoice Content' },
      { id: 3, type: 'ai-chat',    label: 'AI Analysis Output' }
    ]
  },
  {
    id: 2,
    name: 'Customer FAQ Bot',
    desc: 'AI support chatbot trained on your docs',
    status: 'draft',
    calls: 0,
    updated: '1d ago',
    tag: 'Support',
    components: [
      { id: 1, type: 'textarea',   label: 'Company Knowledge Base' },
      { id: 2, type: 'ai-chat',    label: 'Customer Chat Interface' }
    ]
  },
]

/**
 * Initialize the store with demo data if empty.
 */
function init() {
  const existing = localStorage.getItem(STORAGE_KEY)
  if (!existing) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_PROJECTS))
  }
}

/**
 * Get all projects.
 */
export function getProjects() {
  init()
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  } catch (e) {
    console.error('Failed to parse projects:', e)
    return []
  }
}

/**
 * Get a single project by ID.
 */
export function getProjectById(id) {
  const projects = getProjects()
  return projects.find(p => p.id === parseInt(id)) || null
}

/**
 * Save or update a project.
 */
export function saveProject(project) {
  const projects = getProjects()
  const idx = projects.findIndex(p => p.id === project.id)
  
  const updatedProject = {
    ...project,
    updated: 'Just now',
    calls: project.calls || 0,
    tag: project.tag || 'AI App'
  }

  if (idx > -1) {
    projects[idx] = updatedProject
  } else {
    // New project
    updatedProject.id = Date.now()
    projects.push(updatedProject)
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
  return updatedProject
}

/**
 * Delete a project.
 */
export function deleteProject(id) {
  const projects = getProjects()
  const filtered = projects.filter(p => p.id !== parseInt(id))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  return filtered
}

/**
 * Get a default template for a "Best Practice" AI app.
 */
export function getBestPracticeTemplate() {
  return {
    name: 'Smart Assistant',
    desc: 'A versatile AI-powered assistant for your business.',
    tag: 'Assistant',
    components: [
      { id: 1, type: 'text-input', label: 'User Context / Name' },
      { id: 2, type: 'textarea',   label: 'Your Question' },
      { id: 3, type: 'ai-chat',    label: 'AI Response' }
    ]
  }
}
