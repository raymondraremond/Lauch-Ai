/**
 * ProjectStore.js
 * Manages project persistence in Supabase for LaunchAI.
 */
import { supabase } from './supabaseClient'

const DEMO_PROJECTS = [
  {
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
 * Get projects for the current authenticated user.
 */
export async function getProjects() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects:', error)
    return []
  }

  return data
}

/**
 * Get a single project by ID, ensuring it belongs to the current user.
 */
export async function getProjectById(id) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.error(`Error fetching project ${id}:`, error)
    return null
  }

  return data
}

/**
 * Save or update a project for the current authenticated user.
 */
export async function saveProject(project) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Authentication required to save projects.')

  const updatedProject = {
    ...project,
    user_id: user.id,
    updated_at: new Date().toISOString(),
    calls: project.calls || 0,
    tag: project.tag || 'AI App'
  }

  // If id is null, remove it so Supabase generates a UUID
  if (!updatedProject.id) delete updatedProject.id


  const { data, error } = await supabase
    .from('projects')
    .upsert(updatedProject)
    .select()
    .single()

  if (error) {
    console.error('Error saving project:', error)
    throw error
  }

  return data
}

/**
 * Delete a project, ensuring user ownership.
 */
export async function deleteProject(id) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Authentication required.')

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting project:', error)
    throw error
  }

  return true
}

/**
 * Get a default template for a "Best Practice" AI app.
 */
export function getBestPracticeTemplate() {
  return {
    name: 'Marketing Genius AI',
    desc: 'Professional-grade ad copy and product descriptions generator.',
    tag: 'Marketing',
    components: [
      { id: 1, type: 'text-input', label: 'Product Name', variableId: 'product_name' },
      { id: 2, type: 'dropdown',   label: 'Brand Tone',  variableId: 'tone' },
      { id: 3, type: 'textarea',   label: 'Key Benefits', variableId: 'benefits' },
      { 
        id: 4, 
        type: 'structured-result', 
        label: 'Generated Ad Copy', 
        variableId: 'ad_copy',
        systemPrompt: 'Act as a world-class copywriter. Write a compelling, {{tone}} advertisement for {{product_name}} focusing on these benefits: {{benefits}}. Use a professional structure with a headline and two paragraphs.'
      }
    ]
  }
}
