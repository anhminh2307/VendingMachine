import { supabase } from '../lib/supabase';

export type TicketStatus = 'PENDING' | 'COMPLETED' | 'CANCELED';

export interface TicketItem {
  id: string;
  ticketId: string;
  slotId: string;
  productId: string;
  expectedQty: number;
  actualQty?: number | null;
  createdAt: string;
  Slot?: {
    id: string;
    slotCode: string;
    floorId: string;
    Floor?: { floorNumber: number };
  };
  Product?: {
    id: string;
    name: string;
    imageUrl?: string;
  };
}

export interface Ticket {
  id: string;
  machineId: string;
  assignedToId: string;
  status: TicketStatus;
  createdAt: string;
  Machine?: { id: string; name: string; location: string };
  AssignedTo?: { id: string; username: string; avatarUrl?: string };
  TicketItems?: TicketItem[];
}

export interface CreateTicketItemPayload {
  slotId: string;
  productId: string;
  expectedQty: number;
}

const generateId = (): string =>
  Date.now().toString(36) + Math.random().toString(36).substring(2, 8);

// Lấy danh sách
export const getTickets = async (userId: string, isAdmin: boolean): Promise<Ticket[]> => {
  let query = supabase
    .from('Ticket')
    .select(`
      *,
      Machine (id, name, location),
      AssignedTo: User!Ticket_assignedToId_fkey (id, username, avatarUrl)
    `)
    .order('createdAt', { ascending: false });

  if (!isAdmin) {
    query = query.eq('assignedToId', userId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

// Chi tiết 1 ticket
export const getTicketDetail = async (ticketId: string): Promise<Ticket> => {
  const { data, error } = await supabase
    .from('Ticket')
    .select(`
      *,
      Machine (id, name, location),
      AssignedTo: User!Ticket_assignedToId_fkey (id, username, avatarUrl),
      TicketItems: TicketItem (
        *,
        Product (id, name, imageUrl),
        Slot (id, slotCode, floorId, Floor(floorNumber))
      )
    `)
    .eq('id', ticketId)
    .single();

  if (error) throw error;
  return data;
};

// Kiểm tra filler có được phân công máy này không
export const checkFillerAccessToMachine = async (
  userId: string,
  machineId: string
): Promise<boolean> => {
  const { data, error } = await supabase
    .from('Ticket')
    .select('id')
    .eq('assignedToId', userId)
    .eq('machineId', machineId)
    .in('status', ['PENDING', 'IN_PROGRESS'])
    .limit(1);

  if (error) throw error;
  return (data?.length || 0) > 0;
};

// Tạo ticket
export const createTicket = async (
  machineId: string,
  assignedToId: string,
  items: CreateTicketItemPayload[]
): Promise<void> => {
  const ticketId = generateId();

  const { error: ticketError } = await supabase.from('Ticket').insert([{
    id: ticketId,
    machineId,
    assignedToId,
    status: 'PENDING',
  }]);
  if (ticketError) throw ticketError;

  const ticketItems = items.map(item => ({
    id: generateId(),
    ticketId,
    slotId: item.slotId,
    productId: item.productId,
    expectedQty: item.expectedQty,
  }));

  const { error: itemsError } = await supabase.from('TicketItem').insert(ticketItems);
  if (itemsError) throw itemsError;
};

// Xóa ticket
export const deleteTicket = async (ticketId: string): Promise<void> => {
  const { error: itemsError } = await supabase
    .from('TicketItem')
    .delete()
    .eq('ticketId', ticketId);
  if (itemsError) throw itemsError;

  const { error } = await supabase
    .from('Ticket')
    .delete()
    .eq('id', ticketId);
  if (error) throw error;
};

// Cập nhật số lượng hàng
export const updateTicketItemActualQty = async (
  ticketItemId: string,
  actualQty: number,
  userId: string,
  oldQty: number | null
): Promise<void> => {
  const { error: updateError } = await supabase
    .from('TicketItem')
    .update({ actualQty })
    .eq('id', ticketItemId);
  if (updateError) throw updateError;

  // log
  const { error: logError } = await supabase.from('TicketItemLog').insert([{
    id: generateId(),
    ticketItemId,
    userId,
    oldQty,
    newQty: actualQty,
  }]);
  if (logError) throw logError;
};

export const completeTicket = async (ticketId: string): Promise<void> => {
  const { error } = await supabase
    .from('Ticket')
    .update({ status: 'COMPLETED' })
    .eq('id', ticketId);
  if (error) throw error;
};

// Kiểm tra filler có được phân quyền không
export const checkCanFill = async (
  userId: string,
  machineId: string
): Promise<boolean> => {
  const { data, error } = await supabase
    .from('Ticket')
    .select('id')
    .eq('assignedToId', userId)
    .eq('machineId', machineId)
    .eq('status', 'PENDING')
    .limit(1);

  if (error) throw error;
  return (data?.length || 0) > 0;
};