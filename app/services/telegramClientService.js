// Temporarily disabled for build compatibility
// This file will be restored after the revert is complete

import { supabase } from '../supabase';

class TelegramClientService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.monitoredChats = new Map();
    this.parentId = null;
    this.childId = null;
  }

  async initializeForChild(childId, parentId, sessionString = null) {
    console.log('Telegram client temporarily disabled for build compatibility');
    return false;
  }

  getStatus() {
    return {
      isConnected: false,
      monitoredChats: 0,
      parentId: this.parentId,
      childId: this.childId
    };
  }

  async disconnect() {
    console.log('Telegram client disconnected');
  }
}

export const telegramClientService = new TelegramClientService();