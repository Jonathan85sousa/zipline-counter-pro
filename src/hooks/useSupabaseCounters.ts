
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
    console.log('🔄 Carregando dados iniciais...');
    loadInitialData();
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    console.log('🔗 Configurando subscriptions em tempo real...');
    
    const countsChannel = supabase
      .channel('descent-counts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'descent_counts'
        },
        (payload) => {
          console.log('📊 Mudança detectada em descent_counts:', payload);
          loadCounts();
        }
      )
      .subscribe((status) => {
        console.log('📡 Status da conexão counts:', status);
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
        (payload) => {
          console.log('📝 Mudança detectada em descent_records:', payload);
          loadRecords();
        }
      )
      .subscribe((status) => {
        console.log('📡 Status da conexão records:', status);
      });

    return () => {
      console.log('🔌 Removendo channels...');
      supabase.removeChannel(countsChannel);
      supabase.removeChannel(recordsChannel);
    };
  }, []);

  const loadInitialData = async () => {
    try {
      console.log('📥 Carregando dados...');
      await Promise.all([loadCounts(), loadRecords()]);
      console.log('✅ Dados carregados com sucesso');
    } catch (error) {
      console.error('❌ Erro ao carregar dados iniciais:', error);
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
    console.log('📊 Carregando contagens para:', today);
    
    const { data, error } = await supabase
      .from('descent_counts')
      .select('*')
      .eq('date', today);

    if (error) {
      console.error('❌ Erro ao carregar contagens:', error);
      return;
    }

    console.log('📊 Contagens carregadas:', data);

    if (data && data.length > 0) {
      const countsMap = data.reduce((acc, item) => {
        acc[item.type] = item.count;
        return acc;
      }, {} as Record<string, number>);
      
      // Garantir que todos os tipos estejam presentes
      const completeCounts = {
        B: countsMap.B || 0,
        T0: countsMap.T0 || 0,
        T1: countsMap.T1 || 0,
        T2: countsMap.T2 || 0
      };
      
      console.log('✅ Contagens definidas:', completeCounts);
      setCounts(completeCounts);
    } else {
      console.log('⚡ Inicializando contagens para hoje...');
      await initializeTodayCounts();
    }
  };

  const loadRecords = async () => {
    const today = new Date().toISOString().split('T')[0];
    console.log('📝 Carregando registros para:', today);
    
    const { data, error } = await supabase
      .from('descent_records')
      .select('*')
      .eq('date', today)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('❌ Erro ao carregar registros:', error);
      return;
    }

    console.log('📝 Registros carregados:', data?.length || 0);
    setRecords(data || []);
  };

  const initializeTodayCounts = async () => {
    const today = new Date().toISOString().split('T')[0];
    const types = ['B', 'T0', 'T1', 'T2'];
    
    console.log('🔧 Inicializando contagens para:', today);
    
    try {
      const { error } = await supabase
        .from('descent_counts')
        .upsert(
          types.map(type => ({
            type,
            count: 0,
            date: today
          })),
          { onConflict: 'type,date' }
        );

      if (error) {
        console.error('❌ Erro ao inicializar contagens:', error);
      } else {
        console.log('✅ Contagens inicializadas');
        // Recarregar após inicializar
        await loadCounts();
      }
    } catch (error) {
      console.error('❌ Erro na inicialização:', error);
    }
  };

  const addRecord = async (type: 'B' | 'T0' | 'T1' | 'T2') => {
    console.log('➕ Adicionando registro do tipo:', type);
    
    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      // Adicionar registro
      const { error: recordError } = await supabase
        .from('descent_records')
        .insert({
          type,
          operator_name: operatorName || null,
          timestamp: now.toISOString(),
          date: today
        });

      if (recordError) {
        console.error('❌ Erro ao inserir registro:', recordError);
        throw recordError;
      }

      console.log('✅ Registro inserido');

      // Atualizar contagem
      const newCount = (counts[type] || 0) + 1;
      console.log('📊 Nova contagem para', type, ':', newCount);
      
      const { error: countError } = await supabase
        .from('descent_counts')
        .upsert({
          type,
          count: newCount,
          date: today,
          updated_at: now.toISOString()
        }, { onConflict: 'type,date' });

      if (countError) {
        console.error('❌ Erro ao atualizar contagem:', countError);
        throw countError;
      }

      console.log('✅ Contagem atualizada');

      toast({
        title: 'Sucesso',
        description: `Descida ${type} registrada!`
      });

    } catch (error) {
      console.error('❌ Erro ao adicionar registro:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao registrar descida',
        variant: 'destructive'
      });
    }
  };

  const deleteRecord = async (id: string) => {
    console.log('🗑️ Deletando registro:', id);
    
    try {
      // Encontrar o registro para obter o tipo
      const recordToDelete = records.find(r => r.id === id);
      if (!recordToDelete) {
        console.log('❌ Registro não encontrado');
        return;
      }

      // Deletar do banco
      const { error: deleteError } = await supabase
        .from('descent_records')
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error('❌ Erro ao deletar registro:', deleteError);
        throw deleteError;
      }

      console.log('✅ Registro deletado');

      // Atualizar contagem
      const today = new Date().toISOString().split('T')[0];
      const newCount = Math.max(0, (counts[recordToDelete.type] || 0) - 1);
      
      const { error: countError } = await supabase
        .from('descent_counts')
        .upsert({
          type: recordToDelete.type,
          count: newCount,
          date: today,
          updated_at: new Date().toISOString()
        }, { onConflict: 'type,date' });

      if (countError) {
        console.error('❌ Erro ao atualizar contagem:', countError);
        throw countError;
      }

      console.log('✅ Contagem atualizada após deletar');

      toast({
        title: 'Sucesso',
        description: 'Registro excluído!'
      });

    } catch (error) {
      console.error('❌ Erro ao deletar registro:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao excluir registro',
        variant: 'destructive'
      });
    }
  };

  const clearAllRecords = async () => {
    console.log('🧹 Limpando todos os registros...');
    
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Deletar todos os registros de hoje
      const { error: deleteError } = await supabase
        .from('descent_records')
        .delete()
        .eq('date', today);

      if (deleteError) {
        console.error('❌ Erro ao deletar registros:', deleteError);
        throw deleteError;
      }

      console.log('✅ Registros deletados');

      // Zerar todas as contagens
      const types = ['B', 'T0', 'T1', 'T2'];
      const { error: countError } = await supabase
        .from('descent_counts')
        .upsert(
          types.map(type => ({
            type,
            count: 0,
            date: today,
            updated_at: new Date().toISOString()
          })),
          { onConflict: 'type,date' }
        );

      if (countError) {
        console.error('❌ Erro ao zerar contagens:', countError);
        throw countError;
      }

      console.log('✅ Contagens zeradas');

      toast({
        title: 'Sucesso',
        description: 'Todas as contagens foram zeradas!'
      });

    } catch (error) {
      console.error('❌ Erro ao limpar registros:', error);
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
