import { useState, useCallback } from 'react';
import { supabase, getUserId } from '../supabaseClient';

export const useSimulationResults = () => {
  const [savedResults, setSavedResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Save simulation result
  const saveResult = useCallback(async (params, metrics, notes = '') => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('simulation_results')
        .insert({
          user_id: getUserId(),
          params: params,
          metrics: metrics,
          notes: notes
        })
        .select()
        .single();

      if (error) throw error;

      alert('✅ Simulation result saved successfully!');
      return data;
    } catch (error) {
      console.error('Error saving result:', error);
      alert('❌ Failed to save result');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load user's saved results
  const loadResults = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('simulation_results')
        .select('*')
        .eq('user_id', getUserId())
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setSavedResults(data || []);
      return data;
    } catch (error) {
      console.error('Error loading results:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete a result
  const deleteResult = useCallback(async (resultId) => {
    try {
      const { error } = await supabase
        .from('simulation_results')
        .delete()
        .eq('id', resultId);

      if (error) throw error;

      setSavedResults(prev => prev.filter(r => r.id !== resultId));
      alert('Result deleted');
    } catch (error) {
      console.error('Error deleting result:', error);
      alert('Failed to delete result');
    }
  }, []);

  // Load specific result
  const loadResult = useCallback(async (resultId) => {
    try {
      const { data, error } = await supabase
        .from('simulation_results')
        .select('*')
        .eq('id', resultId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error loading result:', error);
      return null;
    }
  }, []);

  return {
    savedResults,
    isLoading,
    saveResult,
    loadResults,
    deleteResult,
    loadResult
  };
};