import { supabase } from '../lib/supabase';

export type MachineStatus = 'ACTIVE' | 'INACTIVE';

export interface Machine {
  id: string;
  name: string;
  location: string;
  status: MachineStatus;
}

export interface Slot {
  id: string;
  floorId: string;
  slotNumber: number;
  slotCode: string;
  currentQty: number;
  maxCapacity: number;
  productId?: string | null;
  Product?: {
    id: string;
    name: string;
    imageUrl?: string;
    price: number;
  } | null;
}

export interface Floor {
  id: string;
  machineId: string;
  floorNumber: number;
  Slots: Slot[];
}

export interface MachineDetail extends Machine {
  Floors: Floor[];
}

const generateId = (): string =>
  Date.now().toString(36) + Math.random().toString(36).substring(2, 8);


export const getMachines = async (): Promise<Machine[]> => {
  const { data, error } = await supabase
    .from('Machine')
    .select('*')
    .order('status', { ascending: false })
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const getMachineDetail = async (machineId: string): Promise<MachineDetail> => {
  const { data, error } = await supabase
    .from('Machine')
    .select(`
      *,
      Floors: Floor (
        *,
        Slots: Slot (
          *,
          Product (id, name, imageUrl, price)
        )
      )
    `)
    .eq('id', machineId)
    .single();

  if (error) throw error;


  data.Floors = (data.Floors || [])
    .sort((a: Floor, b: Floor) => a.floorNumber - b.floorNumber)
    .map((floor: Floor) => ({
      ...floor,
      Slots: (floor.Slots || []).sort((a: Slot, b: Slot) => a.slotNumber - b.slotNumber),
    }));

  return data;
};

export const createMachine = async (
  name: string,
  location: string
): Promise<void> => {
  const { error } = await supabase.from('Machine').insert([{
    id: generateId(),
    name,
    location,
    status: 'ACTIVE',
  }]);
  if (error) throw error;
};

export const updateMachine = async (
  id: string,
  name: string,
  location: string,
  status: MachineStatus
): Promise<void> => {
  const { error } = await supabase
    .from('Machine')
    .update({ name, location, status })
    .eq('id', id);
  if (error) throw error;
};

export const deleteMachine = async (id: string): Promise<void> => {
  const { error } = await supabase.from('Machine').delete().eq('id', id);
  if (error) throw error;
};


export const addFloor = async (machineId: string, floorNumber: number): Promise<void> => {
  const { error } = await supabase.from('Floor').insert([{
    id: generateId(),
    machineId,
    floorNumber,
  }]);
  if (error) throw error;
};

export const deleteFloor = async (floorId: string): Promise<void> => {
  const { error } = await supabase.from('Floor').delete().eq('id', floorId);
  if (error) throw error;
};


export const addSlot = async (
  floorId: string,
  slotNumber: number,
  slotCode: string
): Promise<void> => {
  const { error } = await supabase.from('Slot').insert([{
    id: generateId(),
    floorId,
    slotNumber,
    slotCode,
    currentQty: 0,
    maxCapacity: 10,
  }]);
  if (error) throw error;
};

export const updateSlotProduct = async (
  slotId: string,
  productId: string | null,
  maxCapacity: number
): Promise<void> => {
  const { error } = await supabase
    .from('Slot')
    .update({ productId, maxCapacity })
    .eq('id', slotId);
  if (error) throw error;
};


export const updateSlotQuantity = async (
  slotId: string,
  currentQty: number
): Promise<void> => {
  const { error } = await supabase
    .from('Slot')
    .update({ currentQty })
    .eq('id', slotId);
  if (error) throw error;
};

export const deleteSlot = async (slotId: string): Promise<void> => {
  const { error } = await supabase.from('Slot').delete().eq('id', slotId);
  if (error) throw error;
};