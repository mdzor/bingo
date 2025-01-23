export type BingoGoal = {
    id: string;
    text: string;
    category: 'fitness' | 'travel' | 'personal' | 'career' | 'relationships' | 'learning' | 'financial' | 'wellness';
  };
  
  export const bingoGoals: BingoGoal[] = [
    // Fitness
    { id: 'bench100', text: 'Benchpress 100kg', category: 'fitness' },
    { id: 'run5k', text: 'Run a 5K race', category: 'fitness' },
    { id: 'yoga30', text: 'Complete 30 days of yoga', category: 'fitness' },
    { id: 'hiking', text: 'Go hiking once a month', category: 'fitness' },
    { id: 'gym100', text: 'Visit the gym 100 times this year', category: 'fitness' },
    { id: 'sports', text: 'Join a sports team or club', category: 'fitness' },
  
    // Travel
    { id: 'japan', text: 'Visit Japan', category: 'travel' },
    { id: 'solo', text: 'Take a solo trip', category: 'travel' },
    { id: 'camping', text: 'Go camping in 3 different locations', category: 'travel' },
    { id: 'road', text: 'Go on a road trip', category: 'travel' },
    { id: 'countries', text: 'Visit 3 new countries', category: 'travel' },
    { id: 'local', text: 'Explore 5 nearby cities', category: 'travel' },
  
    // Personal Development
    { id: 'meditation', text: 'Meditate for 10 minutes daily', category: 'personal' },
    { id: 'journal', text: 'Keep a journal for 6 months', category: 'personal' },
    { id: 'hobby', text: 'Start a new hobby', category: 'personal' },
    { id: 'volunteer', text: 'Volunteer monthly', category: 'personal' },
    { id: 'reading', text: 'Read 24 books', category: 'personal' },
    { id: 'digital', text: 'Have a digital detox weekend', category: 'personal' },
  
    // Career
    { id: 'skills', text: 'Learn 3 new job-related skills', category: 'career' },
    { id: 'network', text: 'Attend 3 networking events', category: 'career' },
    { id: 'side', text: 'Start a side project', category: 'career' },
    { id: 'mentor', text: 'Find a mentor', category: 'career' },
    { id: 'present', text: 'Give a presentation at work', category: 'career' },
    { id: 'learn', text: 'Take an online course in your field', category: 'career' },
  
    // Relationships
    { id: 'date', text: 'Have 1 date night per month', category: 'relationships' },
    { id: 'parents', text: 'Call parents every month', category: 'relationships' },
    { id: 'friends', text: 'Organize monthly friend gatherings', category: 'relationships' },
    { id: 'gratitude', text: 'Write thank-you notes to 5 people', category: 'relationships' },
    { id: 'reunion', text: 'Attend a family reunion', category: 'relationships' },
    { id: 'tradition', text: 'Start a new family tradition', category: 'relationships' },
  
    // Learning
    { id: 'language', text: 'Learn a new language', category: 'learning' },
    { id: 'instrument', text: 'Learn to play an instrument', category: 'learning' },
    { id: 'cook', text: 'Master 10 new recipes', category: 'learning' },
    { id: 'art', text: 'Take an art class', category: 'learning' },
    { id: 'code', text: 'Build a personal project using code', category: 'learning' },
    { id: 'dance', text: 'Learn a new style of dance', category: 'learning' },
  
    // Financial
    { id: 'save', text: 'Save 20% of monthly income', category: 'financial' },
    { id: 'invest', text: 'Start investing regularly', category: 'financial' },
    { id: 'debt', text: 'Pay off a specific debt', category: 'financial' },
    { id: 'budget', text: 'Create and stick to a budget', category: 'financial' },
    { id: 'emergency', text: 'Build emergency fund', category: 'financial' },
    { id: 'passive', text: 'Create a passive income stream', category: 'financial' },
  
    // Wellness
    { id: 'sleep', text: 'Maintain consistent sleep schedule', category: 'wellness' },
    { id: 'water', text: 'Drink 2L of water daily', category: 'wellness' },
    { id: 'meal', text: 'Meal prep weekly', category: 'wellness' },
    { id: 'nature', text: 'Spend time in nature weekly', category: 'wellness' },
    { id: 'stress', text: 'Practice stress management techniques', category: 'wellness' },
    { id: 'screen', text: 'Reduce screen time by 30%', category: 'wellness' }
  ];