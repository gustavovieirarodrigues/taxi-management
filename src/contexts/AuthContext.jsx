import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

// Função auxiliar para buscar dados do usuário
const fetchUserData = async (userId, retries = 3) => {
  try {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const { data, error } = await Promise.race([
          supabase
            .from('users')
            .select('role, name')
            .eq('id', userId)
            .single(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout')), 5000)
          ),
        ]);

        if (!error && data?.role) {
          console.log('Dados do usuário carregados:', data);
          return { role: data.role, name: data.name || 'Usuário' };
        }

        if (attempt === retries) {
          console.warn('Falha ao buscar dados do usuário após', retries, 'tentativas');
          return { role: 'motorista', name: 'Usuário' };
        }

        await new Promise(resolve => setTimeout(resolve, 500 * attempt));
      } catch (err) {
        console.warn(`Tentativa ${attempt} de buscar dados do usuário falhou:`, err);
        if (attempt === retries) {
          return { role: 'motorista', name: 'Usuário' };
        }
        await new Promise(resolve => setTimeout(resolve, 500 * attempt));
      }
    }
  } catch (err) {
    console.warn('Erro inesperado ao buscar dados do usuário:', err);
    return { role: 'motorista', name: 'Usuário' };
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Verificar sessão ao carregar
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && isMounted) {
          setUser(session.user);
          const userData = await fetchUserData(session.user.id);
          if (isMounted) {
            setUserRole(userData.role);
            setUserName(userData.name);
          }
        }
      } catch (err) {
        console.warn('Erro ao verificar sessão:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkSession();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (isMounted) {
        if (session?.user) {
          setUser(session.user);
          const userData = await fetchUserData(session.user.id);
          if (isMounted) {
            setUserRole(userData.role);
            setUserName(userData.name);
          }
        } else {
          setUser(null);
          setUserRole(null);
          setUserName(null);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signup = async (email, password, name, role) => {
    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signupError) throw signupError;

    // Criar registro na tabela users
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email,
        name,
        role,
      });

    if (insertError) throw insertError;

    return data;
  };

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  const logout = async () => {
    try {
      // Limpar estado local primeiro
      setUser(null);
      setUserRole(null);
      setUserName(null);

      // Depois fazer logout no Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, userRole, userName, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
