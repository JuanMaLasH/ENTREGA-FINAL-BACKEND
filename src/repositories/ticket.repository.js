import { TicketModel } from "../daos/mongodb/models/ticket.model.js";

export class TicketRepository {
    async crearTicket(ticketData) {
        try {
            const ticket = new TicketModel(ticketData);
            await ticket.save();
            return ticket;
        } catch (error) {
            throw new Error("Error");
        }
    }
}
