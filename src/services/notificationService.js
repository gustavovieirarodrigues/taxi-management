import { supabase } from './supabase';

export const notificationService = {
  // Enviar notificação para um usuário
  async sendNotification(userId, type, message, rideId = null) {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          ride_id: rideId,
          type,
          message,
          read: false,
        });

      if (error) throw error;

      // TODO: Enviar email aqui quando integrado com Resend/SendGrid
      // await this.sendEmailNotification(userId, type, message);

      return { success: true };
    } catch (err) {
      console.error('Erro ao enviar notificação:', err);
      return { success: false, error: err.message };
    }
  },

  // Notificar motorista sobre corrida atribuída
  async notifyRideAssigned(driverId, driverEmail, clientName, origin, destination, scheduledTime) {
    const message = `Nova corrida atribuída! Cliente: ${clientName}, De: ${origin}, Para: ${destination}, Horário: ${new Date(scheduledTime).toLocaleString('pt-BR')}`;

    return this.sendNotification(driverId, 'Corrida Atribuída', message);
  },

  // Marcar notificação como lida
  async markAsRead(notificationId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error('Erro ao marcar notificação como lida:', err);
      return { success: false, error: err.message };
    }
  },

  // Obter notificações não lidas de um usuário
  async getUnreadNotifications(userId) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('read', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar notificações:', err);
      return [];
    }
  },

  // Limpar todas as notificações de um usuário
  async clearNotifications(userId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId);

      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error('Erro ao limpar notificações:', err);
      return { success: false, error: err.message };
    }
  },

  // Método para enviar email (implementar com Resend ou SendGrid)
  async sendEmailNotification(userId, type, message) {
    // Este método deve ser implementado com um serviço de email
    // Por exemplo, usando Resend: https://resend.com/
    // ou SendGrid: https://sendgrid.com/

    // Exemplo:
    // const response = await fetch('/api/send-email', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ userId, type, message })
    // });

    console.log(`Email notificação: ${type} - ${message}`);
  }
};
