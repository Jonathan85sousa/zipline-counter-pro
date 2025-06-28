
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type DescentCount = Database['public']['Tables']['descent_counts']['Row'];
type DescentRecord = Database['public']['Tables']['descent_records']['Row'];

export const useSupabaseCounters = (operatorName: string) => {
  const [counts, setCounts] = useState<Record<string, number>>({
    B: 0,
    T0: 0,
    T1: 0,
    T2: 0
  });
  const [records, setRecords] = useState<DescentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    const countsChannel = supabase
      .channel('descent-counts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'descent_counts'
        },
        () => {
          loadCounts();
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    const recordsChannel = supabase
      .channel('descent-records-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'descent_records'
        },
        () => {
          loadRecords();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(countsChannel);
      supabase.removeChannel(recordsChannel);
    };
  }, []);

  const loadInitialData = async () => {
    try {
      await Promise.all([loadCounts(), loadRecords()]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao carregar dados iniciais',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadCounts = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('descent_counts')
      .select('*')
      .eq('date', today);

    if (error) {
      console.error('Error loading counts:', error);
      return;
    }

    if (data && data.length > 0) {
      const countsMap = data.reduce((acc, item) => {
        acc[item.type] = item.count;
        return acc;
      }, {} as Record<string, number>);
      setCounts(countsMap);
    } else {
      // Initialize counts for today if they don't exist
      await initializeTodayCounts();
    }
  };

  const loadRecords = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('descent_records')
      .select('*')
      .eq('date', today)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error loading records:', error);
      return;
    }

    setRecords(data || []);
  };

  const initializeTodayCounts = async () => {
    const today = new Date().toISOString().split('T')[0];
    const types = ['B', 'T0', 'T1', 'T2'];
    
    const { error } = await supabase
      .from('descent_counts')
      .upsert(
        types.map(type => ({
          type,
          count: 0,
          date: today
        }))
      );

    if (error) {
      console.error('Error initializing counts:', error);
    }
  };

  const addRecord = async (type: 'B' | 'T0' | 'T1' | 'T2') => {
    try {
      // Add to records table
      const { error: recordError } = await supabase
        .from('descent_records')
        .insert({
          type,
          operator_name: operatorName || null,
          timestamp: new Date().toISOString(),
          date: new Date().toISOString().split('T')[0]
        });

      if (recordError) {
        throw recordError;
      }

      // Update count
      const today = new Date().toISOString().split('T')[0];
      const { error: countError } = await supabase
        .from('descent_counts')
        .upsert({
          type,
          count: (counts[type] || 0) + 1,
          date: today,
          updated_at: new Date().toISOString()
        });

      if (countError) {
        throw countError;
      }

      toast({
        title: 'Sucesso',
        description: `Descida ${type} registrada!`
      });

    } catch (error) {
      console.error('Error adding record:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao registrar descida',
        variant: 'destructive'
      });
    }
  };

  const deleteRecord = async (id: string) => {
    try {
      // Find the record to get its type
      const recordToDelete = records.find(r => r.id === id);
      if (!recordToDelete) return;

      // Delete from records table
      const { error: deleteError } = await supabase
        .from('descent_records')
        .delete()
        .eq('id', id);

      if (deleteError) {
        throw deleteError;
      }

      // Update count
      const today = new Date().toISOString().split('T')[0];
      const newCount = Math.max(0, (counts[recordToDelete.type] || 0) - 1);
      
      const { error: countError } = await supabase
        .from('descent_counts')
        .upsert({
          type: recordToDelete.type,
          count: newCount,
          date: today,
          updated_at: new Date().toISOString()
        });

      if (countError) {
        throw countError;
      }

      toast({
        title: 'Sucesso',
        description: 'Registro excluído!'
      });

    } catch (error) {
      console.error('Error deleting record:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao excluir registro',
        variant: 'destructive'
      });
    }
  };

  const clearAllRecords = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Delete all records for today
      const { error: deleteError } = await supabase
        .from('descent_records')
        .delete()
        .eq('date', today);

      if (deleteError) {
        throw deleteError;
      }

      // Reset all counts to 0
      const types = ['B', 'T0', 'T1', 'T2'];
      const { error: countError } = await supabase
        .from('descent_counts')
        .upsert(
          types.map(type => ({
            type,
            count: 0,
            date: today,
            updated_at: new Date().toISOString()
          }))
        );

      if (countError) {
        throw countError;
      }

      toast({
        title: 'Sucesso',
        description: 'Todas as contagens foram zeradas!'
      });

    } catch (error) {
      console.error('Error clearing records:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao zerar contagens',
        variant: 'destructive'
      });
    }
  };

  return {
    counts,
    records,
    isLoading,
    isConnected,
    addRecord,
    deleteRecord,
    clearAllRecords
  };
};
