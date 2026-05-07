import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import {
  Ticket, TicketItem,
  getTicketDetail,
  updateTicketItemActualQty, completeTicket,
} from '../services/ticketService';

export const useTicketDetail = (ticketId: string) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [actualQties, setActualQties] = useState<Record<string, number>>({});

  const isCompleted = ticket?.status === 'COMPLETED'
  const isCanceled = ticket?.status === 'CANCELED'
  const isPending = ticket?.status === 'PENDING'

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTicketDetail(ticketId);
      setTicket(data);

      const initial: Record<string, number> = {};
      data.TicketItems?.forEach(item => {
        initial[item.id] = item.actualQty ?? item.expectedQty;
      });
      setActualQties(initial);
    } catch (e: any) {
      Alert.alert('Lỗi');
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useFocusEffect(
    useCallback(() => {
      fetchDetail();
    }, [fetchDetail])
  );

  const handleSubmit = async () => {
    if (!ticket || !user) return;

    Alert.alert('Xác nhận', 'Bạn đã fill xong và muốn gửi báo cáo?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xác nhận', onPress: async () => {
          setSubmitting(true);
          try {
            await Promise.all(
              (ticket.TicketItems || []).map(item =>
                updateTicketItemActualQty(
                  item.id,
                  actualQties[item.id] ?? item.expectedQty,
                  user.id,
                  item.actualQty ?? null
                )
              )
            );
            await completeTicket(ticketId);
            fetchDetail();
            router.back();
          } catch (e: any) {
            Alert.alert('Lỗi');
          } finally {
            setSubmitting(false);
          }
        }
      },
    ]);
  };

  return {
    ticket, loading, submitting, isAdmin,
    actualQties, setActualQties,
    handleSubmit,
  };
};