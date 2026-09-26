import { TicketCategory, TicketPriority } from './enums';

export interface TicketAnalysis {
  category: TicketCategory;
  priority: TicketPriority;
  summary: string;
  language: string;
  requiresHuman: boolean;
}
