import React, { useState, useMemo, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom' // --- ADDED ---
import {
  Search,
  Star,
  BookOpen,
  BarChart,
  FlaskConical,
  School,
  Smile,
  Palette,
  Code,
  X, // For modal close
  Check, // For capabilities
  Star as StarIcon, // For ratings
  Radio, // For start chat button
  Plus, // --- ADDED ---
} from 'lucide-react'
import clsx from 'clsx'
import { motion, AnimatePresence } from 'framer-motion' // For animations

// --- 1. Expanded Data Definitions ---

type GptItem = {
  id: string
  name: string
  author: string
  description: string
  iconUrl: string
  categories: string[]
  // --- New fields for modal ---
  rating: number
  ratingCount: string
  rank: string
  rankCategory: string
  conversations: string
  conversationStarters: string[]
  capabilities: { name: string; description: string }[]
  ratingsBreakdown: number[] // 5 numbers, from 1 star to 5 star
}

const categoryData = [
  { id: 'top-picks', name: 'Top Picks', icon: Star },
  { id: 'writing', name: 'Writing', icon: BookOpen },
  { id: 'productivity', name: 'Productivity', icon: BarChart },
  { id: 'research', name: 'Research & Analysis', icon: FlaskConical },
  { id: 'programming', name: 'Programming', icon: Code },
  { id: 'education', name: 'Education', icon: School },
  { id: 'lifestyle', name: 'Lifestyle', icon: Smile },
  { id: 'dall-e', name: 'DALL·E', icon: Palette },
]

// --- NEW: Fully Expanded gptData array ---
const gptData: GptItem[] = [
  // ... (All your gptData remains here, unchanged) ...
  {
    id: 'g-1',
    name: 'Video AI by invideo',
    author: 'by invideo.io',
    description:
      'Generate engaging videos with voice, music, and stock footage from a simple prompt.',
    iconUrl: 'https://api.dicebear.com/8.x/bottts-neutral/svg?seed=invideo',
    categories: ['top-picks', 'productivity', 'dall-e'],
    rating: 4.0,
    ratingCount: '100K+',
    rank: '#4',
    rankCategory: 'in Productivity (EN)',
    conversations: '11M+',
    conversationStarters: [
      "Let's create a youtube shorts video!",
      "Let's create a marketing video.",
      "Let's create an explainer video.",
      "Let's start by creating a script...",
    ],
    capabilities: [
      { name: 'DALL·E Images', description: 'Generates images' },
      { name: 'Code Interpreter & Data Analysis', description: 'Analyzes data' },
      { name: 'Web Search', description: 'Searches the web' },
      { name: 'Actions', description: 'Retrieves or takes actions outside of ChatGPT' },
    ],
    ratingsBreakdown: [15, 5, 10, 20, 50], // 1-star to 5-star
  },
  {
    id: 'g-2',
    name: 'Expedia',
    author: 'by Community Builder',
    description:
      'Bring your trip plans to life – get there, stay there, find things to see and do.',
    iconUrl: 'https://api.dicebear.com/8.x/bottts-neutral/svg?seed=expedia',
    categories: ['top-picks', 'lifestyle'],
    rating: 4.1,
    ratingCount: '75K+',
    rank: '#3',
    rankCategory: 'in Lifestyle (EN)',
    conversations: '7M+',
    conversationStarters: [
      'Find flights to Tokyo for next week.',
      'What are the best hotels in Rome?',
      'Suggest a 3-day itinerary for Paris.',
    ],
    capabilities: [
      { name: 'Actions', description: 'Searches flights, hotels, and activities' },
      { name: 'Web Search', description: 'Finds local information' },
    ],
    ratingsBreakdown: [10, 8, 15, 30, 37],
  },
  {
    id: 'g-3',
    name: 'Canva',
    author: 'by Canva',
    description: 'Effortlessly design anything: presentations, logos, social media posts and more.',
    iconUrl: 'https://api.dicebear.com/8.x/bottts-neutral/svg?seed=canva',
    categories: ['top-picks', 'productivity', 'dall-e'],
    rating: 4.5,
    ratingCount: '500K+',
    rank: '#1',
    rankCategory: 'in Productivity (EN)',
    conversations: '20M+',
    conversationStarters: [
      'Create a presentation for a marketing brief.',
      'Design a logo for my coffee shop.',
      'Make an Instagram post for a new product.',
    ],
    capabilities: [{ name: 'Actions', description: 'Connects to Canva API' }],
    ratingsBreakdown: [5, 2, 8, 25, 60],
  },
  {
    id: 'g-4',
    name: 'Scholar AI',
    author: 'by Community Builder',
    description:
      'AI Research Assistant – search and review 200M+ scientific papers, patents, and books.',
    iconUrl: 'https://api.dicebear.com/8.x/bottts-neutral/svg?seed=scholar',
    categories: ['top-picks', 'research'],
    rating: 4.2,
    ratingCount: '80K+',
    rank: '#2',
    rankCategory: 'in Research (EN)',
    conversations: '8M+',
    conversationStarters: [
      'Find papers on "quantum computing".',
      'Summarize this paper: [link].',
      'What are the latest breakthroughs in AI?',
    ],
    capabilities: [
      { name: 'Web Search', description: 'Searches the web' },
      { name: 'Actions', description: 'Searches academic databases' },
    ],
    ratingsBreakdown: [10, 5, 15, 30, 40],
  },
  {
    id: 'g-5',
    name: 'Code Interpreter',
    author: 'by OpenAI',
    description: 'Analyzes data, creates charts, edits files, and performs complex calculations.',
    iconUrl: 'https://api.dicebear.com/8.x/bottts-neutral/svg?seed=code',
    categories: ['programming', 'research', 'top-picks'],
    rating: 4.7,
    ratingCount: '2M+',
    rank: '#1',
    rankCategory: 'in Programming (EN)',
    conversations: '50M+',
    conversationStarters: [
      'Analyze this CSV file and find trends.',
      'Create a bar chart for this data.',
      'Solve this integral: ...',
    ],
    capabilities: [
      { name: 'Code Interpreter & Data Analysis', description: 'Runs Python code in a sandbox' },
    ],
    ratingsBreakdown: [1, 1, 3, 20, 75],
  },
  {
    id: 'g-6',
    name: 'Creative Writing Coach',
    author: 'by OpenAI',
    description:
      "Get feedback on your plot, characters, and writing style. Helps unblock writer's block.",
    iconUrl: 'https://api.dicebear.com/8.x/bottts-neutral/svg?seed=writing',
    categories: ['writing'],
    rating: 4.6,
    ratingCount: '150K+',
    rank: '#1',
    rankCategory: 'in Writing (EN)',
    conversations: '10M+',
    conversationStarters: [
      'Critique this short story opening.',
      "I have writer's block, give me a prompt.",
      'Help me develop my main character.',
    ],
    capabilities: [],
    ratingsBreakdown: [2, 3, 10, 30, 55],
  },
  {
    id: 'g-7',
    name: 'Math Mentor',
    author: 'by Community Builder',
    description: 'Explains complex math concepts step-by-step, from algebra to calculus.',
    iconUrl: 'https://api.dicebear.com/8.x/bottts-neutral/svg?seed=math',
    categories: ['education', 'research'],
    rating: 4.4,
    ratingCount: '90K+',
    rank: '#1',
    rankCategory: 'in Education (EN)',
    conversations: '9M+',
    conversationStarters: [
      'Explain the Pythagorean theorem.',
      'How do I solve this derivative?',
      'What is a Fourier transform?',
    ],
    capabilities: [
      {
        name: 'Code Interpreter & Data Analysis',
        description: 'Used for solving and visualizing math problems',
      },
    ],
    ratingsBreakdown: [5, 5, 15, 30, 45],
  },
  {
    id: 'g-8',
    name: 'Fitness Planner',
    author: 'by Community Builder',
    description: 'Creates personalized workout and meal plans based on your goals and preferences.',
    iconUrl: 'https://api.dicebear.com/8.x/bottts-neutral/svg?seed=fitness',
    categories: ['lifestyle'],
    rating: 4.0,
    ratingCount: '50K+',
    rank: '#5',
    rankCategory: 'in Lifestyle (EN)',
    conversations: '4M+',
    conversationStarters: [
      'I want to build muscle, create a 4-day workout split.',
      'Give me a 7-day meal plan for weight loss.',
      'What are some good home bodyweight exercises?',
    ],
    capabilities: [],
    ratingsBreakdown: [10, 10, 20, 30, 30],
  },
  {
    id: 'g-9',
    name: 'Logo Creator',
    author: 'by Community Builder',
    description: 'Instantly generate professional logo designs and variations for your brand.',
    iconUrl: 'https://api.dicebear.com/8.x/bottts-neutral/svg?seed=logo',
    categories: ['dall-e', 'productivity'],
    rating: 3.9,
    ratingCount: '200K+',
    rank: '#2',
    rankCategory: 'in DALL·E (EN)',
    conversations: '12M+',
    conversationStarters: [
      'Create a minimalist logo for a coffee shop named "The Grind".',
      'I need a logo with a mountain and a sun.',
      'Generate 4 variations of this logo.',
    ],
    capabilities: [{ name: 'DALL·E Images', description: 'Generates images for logos' }],
    ratingsBreakdown: [20, 10, 15, 25, 30],
  },
  {
    id: 'g-10',
    name: 'Docs Helper',
    author: 'by Community Builder',
    description: 'Answers questions about programming libraries by reading documentation.',
    iconUrl: 'https://api.dicebear.com/8.x/bottts-neutral/svg?seed=docs',
    categories: ['programming'],
    rating: 4.3,
    ratingCount: '40K+',
    rank: '#5',
    rankCategory: 'in Programming (EN)',
    conversations: '3M+',
    conversationStarters: [
      'How do I use the `useEffect` hook in React?',
      'Explain `pandas.DataFrame.groupby`.',
      'Show me an example of a POST request with `axios`.',
    ],
    capabilities: [{ name: 'Web Search', description: 'Finds relevant documentation' }],
    ratingsBreakdown: [5, 5, 10, 40, 40],
  },
  {
    id: 'g-11',
    name: 'SQL Pro',
    author: 'by Community Builder',
    description: 'Writes and optimizes complex SQL queries based on your database schema.',
    iconUrl: 'https://api.dicebear.com/8.x/bottts-neutral/svg?seed=sql',
    categories: ['programming', 'productivity'],
    rating: 4.5,
    ratingCount: '60K+',
    rank: '#3',
    rankCategory: 'in Programming (EN)',
    conversations: '5M+',
    conversationStarters: [
      'Write a query to find the top 5 customers by sales.',
      'Optimize this SQL query: ...',
      'Given this schema, how do I join three tables?',
    ],
    capabilities: [
      { name: 'Code Interpreter & Data Analysis', description: 'Validates and formats SQL' },
    ],
    ratingsBreakdown: [2, 3, 15, 35, 45],
  },
  {
    id: 'g-12',
    name: 'Storybook Illustrator',
    author: 'by OpenAI',
    description: 'Generates whimsical illustrations in a consistent style for any story you write.',
    iconUrl: 'https://api.dicebear.com/8.x/bottts-neutral/svg?seed=storybook',
    categories: ['writing', 'dall-e'],
    rating: 4.1,
    ratingCount: '30K+',
    rank: '#4',
    rankCategory: 'in DALL·E (EN)',
    conversations: '2M+',
    conversationStarters: [
      'Illustrate a "brave knight" in a cartoon style.',
      'Now show the knight fighting a dragon.',
      'Create a coloring book page of a forest.',
    ],
    capabilities: [{ name: 'DALL·E Images', description: 'Generates story illustrations' }],
    ratingsBreakdown: [10, 10, 20, 30, 30],
  },
  // --- New Custom Items Start Here ---
  {
    id: 'g-13',
    name: 'Tailwind CSS Expert',
    author: 'by Dev Community',
    description: 'Generates clean Tailwind CSS components and explains complex class combinations.',
    iconUrl: 'https://api.dicebear.com/8.x/bottts-neutral/svg?seed=tailwind',
    categories: ['programming', 'productivity'],
    rating: 4.8,
    ratingCount: '25K+',
    rank: '#2',
    rankCategory: 'in Programming (EN)',
    conversations: '2M+',
    conversationStarters: [
      'Create a responsive navbar with a logo and links.',
      'How do I make a dark mode toggle with Tailwind?',
      'Explain the difference between `flex` and `grid`.',
    ],
    capabilities: [
      { name: 'Code Interpreter & Data Analysis', description: 'Generates and validates HTML/CSS' },
    ],
    ratingsBreakdown: [1_1, 5, 20, 73],
  },
  {
    id: 'g-14',
    name: 'Kitchen Assistant',
    author: 'by Culinary AI',
    description:
      'Find recipes based on ingredients you have. Get step-by-step cooking instructions.',
    iconUrl: 'https://api.dicebear.com/8.x/bottts-neutral/svg?seed=kitchen',
    categories: ['lifestyle'],
    rating: 4.6,
    ratingCount: '45K+',
    rank: '#2',
    rankCategory: 'in Lifestyle (EN)',
    conversations: '3.5M+',
    conversationStarters: [
      'I have chicken, tomatoes, and rice. What can I make?',
      'Give me a 30-minute vegan dinner recipe.',
      'How do I poach an egg?',
    ],
    capabilities: [{ name: 'Web Search', description: 'Finds recipes from across the web' }],
    ratingsBreakdown: [2, 3, 10, 35, 50],
  },
  {
    id: 'g-15',
    name: 'Contract Analyzer',
    author: 'by LegalTech Bots',
    description: 'Summarizes legal documents and highlights key clauses, risks, and obligations.',
    iconUrl: 'https://api.dicebear.com/8.x/bottts-neutral/svg?seed=contract',
    categories: ['research', 'productivity', 'education'],
    rating: 4.2,
    ratingCount: '15K+',
    rank: '#5',
    rankCategory: 'in Research (EN)',
    conversations: '1M+',
    conversationStarters: [
      'Analyze this rental agreement and find risks.',
      'Summarize the "Termination" clause.',
      'Explain this NDA in simple terms.',
    ],
    capabilities: [
      {
        name: 'Code Interpreter & Data Analysis',
        description: 'Parses and analyzes uploaded text documents',
      },
    ],
    ratingsBreakdown: [5, 8, 20, 30, 37],
  },
]

// --- 2. Helper Components ---

// GptCard (Now a button to open the modal)
const GptCard = ({ gpt, onClick }: { gpt: GptItem; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="transition-all duration-300 hover:scale-[1.03] h-full text-left"
  >
    <div className="bg-white/70 backdrop-blur-md border border-gray-200/70 rounded-2xl shadow-lg p-6 flex flex-col h-full cursor-pointer h-full">
      <div className="flex items-start space-x-4">
        <img
          src={gpt.iconUrl}
          alt={`${gpt.name} icon`}
          className="w-16 h-16 rounded-full border-2 border-white shadow-sm flex-shrink-0"
        />
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900">{gpt.name}</h3>
        </div>
      </div>
      <p className="text-sm text-gray-700 mt-3 flex-grow">{gpt.description}</p>
      <p className="text-xs text-gray-500 mt-4">{gpt.author}</p>
    </div>
  </button>
)

// Helper for the rating bars
const RatingBar = ({ stars, percentage }: { stars: number; percentage: number }) => (
  <div className="flex items-center space-x-2">
    <span className="text-sm font-medium text-gray-400 w-2">{stars}</span>
    <div className="flex-1 bg-gray-600 rounded-full h-2">
      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${percentage}%` }} />
    </div>
  </div>
)

// --- 3. Modal Component ---
const GptDetailModal = ({ gpt, onClose }: { gpt: GptItem; onClose: () => void }) => {
  // Calculate total ratings for percentages
  const totalRatings = gpt.ratingsBreakdown.reduce((acc, count) => acc + count, 0)

  // Animation variants for Framer Motion
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  }

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={backdropVariants}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="relative bg-gray-800 text-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()} // Prevent click inside from closing modal
        variants={modalVariants}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* --- Modal Content --- */}
        <div className="p-8 pt-12 space-y-6">
          {/* Header */}
          <div className="text-center flex flex-col items-center">
            <img
              src={gpt.iconUrl}
              alt={`${gpt.name} icon`}
              className="w-24 h-24 rounded-full border-4 border-gray-700 shadow-lg"
            />
            <h2 className="text-3xl font-bold mt-4">{gpt.name}</h2>
            <p className="text-sm text-gray-400">{gpt.author}</p>
            <p className="text-lg text-gray-300 mt-2">{gpt.description}</p>
          </div>

          {/* Stats */}
          <div className="flex justify-around text-center">
            <div>
              <StarIcon className="w-5 h-5 text-yellow-400 mx-auto" />
              <p className="text-lg font-semibold">
                {gpt.rating} ({gpt.ratingCount})
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold">{gpt.rank}</p>
              <p className="text-sm text-gray-400">{gpt.rankCategory}</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{gpt.conversations}</p>
              <p className="text-sm text-gray-400">Conversations</p>
            </div>
          </div>

          {/* Conversation Starters */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Conversation Starters</h3>
            <div className="grid grid-cols-2 gap-3">
              {gpt.conversationStarters.map((starter, i) => (
                <button
                  key={i}
                  className="bg-gray-700 p-3 rounded-lg text-sm text-left hover:bg-gray-600 transition-colors"
                >
                  {starter}
                </button>
              ))}
            </div>
          </div>

          {/* Capabilities */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Capabilities</h3>
            <div className="space-y-3">
              {gpt.capabilities.map((cap, i) => (
                <div key={i} className="flex items-start space-x-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-medium">{cap.name}</h4>
                    <p className="text-sm text-gray-400">{cap.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ratings */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Ratings</h3>
            <div className="space-y-2">
              {gpt.ratingsBreakdown
                .slice()
                .reverse()
                .map((count, i) => {
                  const stars = 5 - i
                  const percentage = (count / totalRatings) * 100
                  return <RatingBar key={stars} stars={stars} percentage={percentage} />
                })}
            </div>
          </div>
        </div>

        {/* Footer Button */}
        <div className="sticky bottom-0 bg-gray-800/80 backdrop-blur-md p-6 border-t border-gray-700">
          <button className="w-full bg-white text-black text-lg font-semibold py-3 px-6 rounded-xl flex items-center justify-center space-x-2 hover:bg-gray-200 transition-colors">
            <Radio className="w-6 h-6" />
            <span>Start Chat</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// --- 4. Main Page Component ---

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSection, setActiveSection] = useState('top-picks')
  const [selectedGpt, setSelectedGpt] = useState<GptItem | null>(null)
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map())

  // --- Filtered/Grouped Data ---
  const sections = useMemo(() => {
    const lowerSearch = searchQuery.toLowerCase().trim()
    const gptsAfterSearch = gptData.filter(g => {
      if (lowerSearch === '') return true
      return (
        g.name.toLowerCase().includes(lowerSearch) ||
        g.description.toLowerCase().includes(lowerSearch) ||
        g.author.toLowerCase().includes(lowerSearch)
      )
    })

    return categoryData
      .map(category => ({
        ...category,
        gpts: gptsAfterSearch.filter(gpt => gpt.categories.includes(category.id)),
      }))
      .filter(section => section.gpts.length > 0)
  }, [searchQuery])

  // --- Scrollspy Logic ---
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: '-20% 0px -75% 0px', threshold: 0 }
    )

    const currentRefs = sectionRefs.current
    currentRefs.forEach(ref => observer.observe(ref))

    return () => {
      currentRefs.forEach(ref => observer.disconnect())
    }
  }, [sections])

  return (
    <div className="min-h-screen p-6 md:p-10 bg-gray-100 text-gray-900 font-sans">
      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/* Header --- MODIFIED --- */}
        <header className="mb-8 flex justify-between items-start">
          {/* Left Side: Title and Description */}
          <div>
            <h1 className="text-5xl font-bold text-gray-800"> Chatbot</h1>
            <p className="text-xl text-gray-600 mt-2">
              Discover and create custom versions of Chatbot that combine instructions, extra
              knowledge, and any combination of skills.
            </p>
          </div>

          {/* --- ADDED THIS BUTTON --- */}
          <Link
            to="/chatbot" // Navigates to your BYOChatbot page
            className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-full transition-colors hover:bg-gray-600 flex-shrink-0 ml-6" // Added ml-6 for spacing
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium text-sm">Create</span>
          </Link>
          {/* --- END OF NEW BUTTON --- */}
        </header>

        {/* Sticky Header (Search + Nav) */}
        <div className="sticky top-16 z-10 bg-gray-100/80 backdrop-blur-md pt-4 pb-2">
          {/* Search Bar */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <input
              type="search"
              placeholder="Search GPTs"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full p-4 pl-14 text-lg bg-white/90 border border-gray-300/70 rounded-xl shadow-sm backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Category Navigation */}
          <nav>
            <div className="flex items-center overflow-x-auto pb-4 space-x-2">
              {categoryData.map(category => (
                <a
                  key={category.id}
                  href={`#${category.id}`}
                  className={clsx(
                    'flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 whitespace-nowrap',
                    activeSection === category.id
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-white/80 border border-gray-300/90 text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <category.icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{category.name}</span>
                </a>
              ))}
            </div>
          </nav>
        </div>

        {/* Content Grid Section */}
        <main className="pt-8">
          {sections.length > 0 ? (
            sections.map(section => (
              <section
                key={section.id}
                id={section.id}
                ref={el => {
                  if (el) sectionRefs.current.set(section.id, el)
                  else sectionRefs.current.delete(section.id)
                }}
                className="mb-12"
                style={{ scrollMarginTop: '13rem' }}
              >
                <h2 className="text-3xl font-semibold text-gray-800">{section.name}</h2>
                <p className="text-md text-gray-600 mb-6">
                  {section.id === 'top-picks'
                    ? 'Curated top picks from this week'
                    : `GPTs for ${section.name}`}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {section.gpts.map(gpt => (
                    <GptCard key={gpt.id} gpt={gpt} onClick={() => setSelectedGpt(gpt)} />
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div className="text-center col-span-full py-16 bg-white/60 rounded-2xl">
              <h3 className="text-2xl font-semibold text-gray-700">No GPTs Found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your search query.</p>
            </div>
          )}
        </main>
      </div>

      {/* --- 5. Render Modal --- */}
      <AnimatePresence>
        {selectedGpt && <GptDetailModal gpt={selectedGpt} onClose={() => setSelectedGpt(null)} />}
      </AnimatePresence>
    </div>
  )
}
