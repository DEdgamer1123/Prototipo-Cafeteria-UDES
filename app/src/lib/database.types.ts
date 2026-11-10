/**
 * database.types.ts — tipos del esquema `public` de UDES Food.
 *
 * NOTA: escrito a mano para espejar `supabase/migrations/*.sql`.
 * Cuando el proyecto esté enlazado, regenerar con:
 *   supabase gen types typescript --project-id <ref> > app/src/lib/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      cafeterias: {
        Row: {
          id: string;
          nombre: string;
          sede: string | null;
          direccion: string | null;
          telefono: string | null;
          vende_almuerzos: boolean;
          activo: boolean;
          horario_apertura: string;
          horario_cierre: string;
          creado_en: string;
          actualizado_en: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          sede?: string | null;
          direccion?: string | null;
          telefono?: string | null;
          vende_almuerzos?: boolean;
          activo?: boolean;
          horario_apertura?: string;
          horario_cierre?: string;
        };
        Update: Partial<Database['public']['Tables']['cafeterias']['Insert']>;
        Relationships: [];
      };
      productos: {
        Row: {
          id: string;
          cafeteria_id: string | null;
          nombre: string;
          descripcion: string | null;
          precio: number;
          categoria: 'almuerzos' | 'desayunos' | 'bebidas' | 'snacks';
          es_almuerzo: boolean;
          disponible: boolean;
          stock: number;
          stock_reservado: number;
          imagen_url: string | null;
          creado_en: string;
          actualizado_en: string;
        };
        Insert: {
          id?: string;
          cafeteria_id?: string | null;
          nombre: string;
          descripcion?: string | null;
          precio: number;
          categoria: 'almuerzos' | 'desayunos' | 'bebidas' | 'snacks';
          es_almuerzo?: boolean;
          disponible?: boolean;
          stock?: number;
          stock_reservado?: number;
          imagen_url?: string | null;
        };
        Update: Partial<Database['public']['Tables']['productos']['Insert']>;
        Relationships: [];
      };
      estudiantes: {
        Row: {
          id: string;
          user_id: string | null;
          codigo: string;
          nombre_completo: string;
          correo: string;
          rol: 'student' | 'admin';
          activo: boolean;
          creado_en: string;
          actualizado_en: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          codigo: string;
          nombre_completo: string;
          correo: string;
          rol?: 'student' | 'admin';
          activo?: boolean;
        };
        Update: Partial<Database['public']['Tables']['estudiantes']['Insert']>;
        Relationships: [];
      };
      slots: {
        Row: {
          id: string;
          cafeteria_id: string;
          hora: string;
          cupo_max: number;
          activo: boolean;
          creado_en: string;
        };
        Insert: {
          id?: string;
          cafeteria_id: string;
          hora: string;
          cupo_max?: number;
          activo?: boolean;
        };
        Update: Partial<Database['public']['Tables']['slots']['Insert']>;
        Relationships: [];
      };
      pedidos: {
        Row: {
          id: string;
          codigo: string;
          estudiante_id: string;
          estudiante_codigo: string;
          estudiante_nombre: string;
          cafeteria_id: string;
          estado: 'recibido' | 'preparando' | 'listo' | 'cancelado' | 'expirado';
          franja_hora: string | null;
          total: number;
          idempotency_key: string;
          ip_checkout: string | null;
          expira_en: string;
          creado_en: string;
          actualizado_en: string;
        };
        Insert: {
          id?: string;
          codigo: string;
          estudiante_id: string;
          estudiante_codigo: string;
          estudiante_nombre: string;
          cafeteria_id: string;
          estado?: Database['public']['Tables']['pedidos']['Row']['estado'];
          franja_hora?: string | null;
          total: number;
          idempotency_key: string;
          expira_en?: string;
        };
        Update: Partial<Database['public']['Tables']['pedidos']['Insert']>;
        Relationships: [];
      };
      pedido_items: {
        Row: {
          id: string;
          pedido_id: string;
          producto_id: string | null;
          nombre_producto: string;
          precio_unitario: number;
          cantidad: number;
          subtotal: number;
          creado_en: string;
        };
        Insert: {
          id?: string;
          pedido_id: string;
          producto_id?: string | null;
          nombre_producto: string;
          precio_unitario: number;
          cantidad: number;
          subtotal: number;
        };
        Update: Partial<Database['public']['Tables']['pedido_items']['Insert']>;
        Relationships: [];
      };
      pagos: {
        Row: {
          id: string;
          pedido_id: string;
          proveedor: 'wompi' | 'transferencia';
          referencia: string;
          payment_id: string | null;
          estado: 'PENDING' | 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR';
          monto: number;
          monto_centavos: number;
          payload: Json | null;
          creado_en: string;
          actualizado_en: string;
        };
        Insert: {
          id?: string;
          pedido_id: string;
          proveedor?: 'wompi' | 'transferencia';
          referencia: string;
          payment_id?: string | null;
          estado?: Database['public']['Tables']['pagos']['Row']['estado'];
          monto: number;
          monto_centavos: number;
          payload?: Json | null;
        };
        Update: Partial<Database['public']['Tables']['pagos']['Insert']>;
        Relationships: [];
      };
      notificaciones: {
        Row: {
          id: string;
          pedido_id: string;
          canal: 'email';
          destinatario: string;
          estado: 'PENDIENTE' | 'ENVIADO' | 'FALLIDO' | 'AT_CAP';
          intentos: number;
          provider_id: string | null;
          ultimo_error: string | null;
          creado_en: string;
          enviado_en: string | null;
        };
        Insert: {
          id?: string;
          pedido_id: string;
          canal?: 'email';
          destinatario: string;
          estado?: Database['public']['Tables']['notificaciones']['Row']['estado'];
          intentos?: number;
          provider_id?: string | null;
          ultimo_error?: string | null;
          enviado_en?: string | null;
        };
        Update: Partial<Database['public']['Tables']['notificaciones']['Insert']>;
        Relationships: [];
      };
      consentimientos: {
        Row: {
          id: string;
          estudiante_id: string;
          version_politica: string;
          aceptado: boolean;
          fecha: string;
          ip: string | null;
          user_agent: string | null;
        };
        Insert: {
          id?: string;
          estudiante_id: string;
          version_politica: string;
          aceptado?: boolean;
          ip?: string | null;
          user_agent?: string | null;
        };
        Update: Partial<Database['public']['Tables']['consentimientos']['Insert']>;
        Relationships: [];
      };
      eventos: {
        Row: {
          id: number;
          tipo: string;
          entidad: string | null;
          entidad_id: string | null;
          actor_id: string | null;
          actor_email: string | null;
          payload: Json | null;
          creado_en: string;
        };
        Insert: {
          tipo: string;
          entidad?: string | null;
          entidad_id?: string | null;
          actor_id?: string | null;
          actor_email?: string | null;
          payload?: Json | null;
        };
        Update: Partial<Database['public']['Tables']['eventos']['Insert']>;
        Relationships: [];
      };
      keepalive: {
        Row: { id: string; touched_at: string };
        Insert: { id?: string; touched_at?: string };
        Update: Partial<Database['public']['Tables']['keepalive']['Insert']>;
        Relationships: [];
      };
      rate_limit: {
        Row: { clave: string; ventana: string; contador: number };
        Insert: { clave: string; ventana: string; contador?: number };
        Update: Partial<Database['public']['Tables']['rate_limit']['Insert']>;
        Relationships: [];
      };
    };
    Views: {
      productos_publicos: {
        Row: {
          id: string;
          cafeteria_id: string | null;
          nombre: string;
          descripcion: string | null;
          precio: number;
          categoria: 'almuerzos' | 'desayunos' | 'bebidas' | 'snacks';
          es_almuerzo: boolean;
          disponible: boolean;
          stock: number;
          stock_reservado: number;
          imagen_url: string | null;
        };
      };
    };
    Functions: {
      es_admin: { Args: Record<string, never>; Returns: boolean };
      crear_pedido: {
        Args: {
          p_items: Json;
          p_franja_hora: string | null;
          p_cafeteria_id: string;
          p_idempotency_key: string;
        };
        Returns: Database['public']['Tables']['pedidos']['Row'];
      };
      avanzar_estado: {
        Args: { p_pedido_id: string; p_estado: string };
        Returns: Database['public']['Tables']['pedidos']['Row'];
      };
      liberar_reservas_vencidas: { Args: Record<string, never>; Returns: number };
      calcular_estimacion_tiempo: {
        Args: { p_cafeteria_id: string; p_franja_hora: string };
        Returns: number;
      };
      franjas_disponibles: {
        Args: { p_cafeteria_id: string };
        Returns: {
          hora: string;
          cupo_max: number;
          pedidos_activos: number;
          cupo_restante: number;
          tiempo_estimado_min: number;
          bloqueada: boolean;
          motivo_bloqueo: string | null;
        }[];
      };
      mis_pedidos: {
        Args: Record<string, never>;
        Returns: {
          id: string;
          codigo: string;
          cafeteria_id: string;
          cafeteria_nombre: string;
          estado: string;
          franja_hora: string | null;
          total: number;
          creado_en: string;
          items: Json;
        }[];
      };
      cola_admin: {
        Args: { p_cafeteria_id?: string | null };
        Returns: {
          id: string;
          codigo: string;
          estudiante_codigo: string;
          estudiante_nombre: string;
          cafeteria_id: string;
          cafeteria_nombre: string;
          estado: string;
          franja_hora: string | null;
          total: number;
          creado_en: string;
          items: Json;
          pago_estado: string;
        }[];
      };
      estadisticas_hoy: {
        Args: { p_cafeteria_id?: string | null };
        Returns: {
          pedidos: number;
          ingresos: number;
          pendientes: number;
          listos: number;
        }[];
      };
      crear_slots_por_defecto: {
        Args: { p_cafeteria_id: string; p_cupo?: number };
        Returns: number;
      };
      rate_limitar: {
        Args: { p_clave: string; p_limite: number; p_ventana: string };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
