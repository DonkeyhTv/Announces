export interface Practice {
    id: number;
    practiceName: string;
    practiceCategoryId: number;
  }
  
  export interface PracticeCategory {
    id: number;
    categoryName: string;
    practices: Practice[];
  }
  
  export interface PracticeResponse {
    practiceList: PracticeCategory[];
  }
  
  export const fetchPractices = async (): Promise<PracticeCategory[]> => {
    try {
      const response = await fetch('http://localhost:3333/api/practices');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data: PracticeResponse = await response.json();
      return data.practiceList;
    } catch (error) {
      console.error('Failed to fetch practices:', error);
      throw error;
    }
  };

  export const fetchPracticesByCategory = async (categoryName: string): Promise<string[]> => { // Return type is now string[]
    const practiceCategories = await fetchPractices();
    const category = practiceCategories.find(category => category.categoryName === categoryName);
    if (!category) {
      return [];
    }
    return category.practices.map(practice => practice.practiceName); // Return array of practice names
  };