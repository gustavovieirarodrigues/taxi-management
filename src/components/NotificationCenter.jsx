import { useEffect, useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';

export const NotificationCenter = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [displayedNotifications, setDisplayedNotifications] = useState([]);

  useEffect(() => {
    if (!user?.id) return;

    // Carregar notificações não lidas
    loadNotifications();

    // Escutar notificações em tempo real
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new;
          setNotifications((prev) => [newNotification, ...prev]);
          // Mostrar notificação por 5 segundos
          showNotification(newNotification);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user?.id]);

  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .eq('read', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      console.error('Erro ao carregar notificações:', err);
    }
  };

  const showNotification = (notification) => {
    setDisplayedNotifications((prev) => [notification, ...prev]);
    setTimeout(() => {
      removeDisplayedNotification(notification.id);
    }, 5000);
  };

  const removeDisplayedNotification = (id) => {
    setDisplayedNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const markAsRead = async (notificationId) => {
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (err) {
      console.error('Erro ao marcar notificação como lida:', err);
    }
  };

  return (
    <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1050 }}>
      {displayedNotifications.map((notification) => (
        <Toast
          key={notification.id}
          onClose={() => removeDisplayedNotification(notification.id)}
          show={true}
          delay={5000}
          autohide
        >
          <Toast.Header>
            <strong className="me-auto">{notification.type}</strong>
          </Toast.Header>
          <Toast.Body>{notification.message}</Toast.Body>
        </Toast>
      ))}
    </ToastContainer>
  );
};
