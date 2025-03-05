import express from 'express';
import { PrismaClient } from '@prisma/client';
import { updateLogData } from "../statusRoute.js";

import { authorize } from '../../middleware/authorize.js';

const prisma = new PrismaClient();
const updateDeliveries = express.Router();

updateDeliveries.get('/:id', authorize(['can_update_deliveries']), async (req, res) => {
    const { id } = req.params;

    try {
        const delivery = await prisma.schedule.findUnique({
            where: { orderId: id },
             
            include: { 
                deliveries: true,
            },
        });
        if (!delivery) {
            return res.status(404).json({ message: 'Delivery not found' });
        }

        
        const scheduleArray = await prisma.schedule.findMany({
            where: { 
                AND: [
                    { scheduledLineId: delivery.scheduledLineId },
                    { scheduledHead: delivery.scheduledHead },
                ],
            },
            include: {
                deliveries: {
                    include: {
                        measurement: true
                    },
                },
            },
        });

        const result = {
            delivery_to_be_updated: delivery,
            scheduleArray: scheduleArray
        }
        

        res.status(200).json(result);
    } catch (error) {
        console.error('Error fetching delivery:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

updateDeliveries.post('/:id', authorize(['can_update_deliveries']), async (req, res) => {

    const { deliveryId, status } = req.body;
    status = status ? status : "preliminary";
    try {
        const delivery = await prisma.deliveries.findUnique({
            where: { id: deliveryId },
        });
        const district = await prisma.districts.findUnique({
            where: { id: delivery.districtId },
        });
        const headsheet = await prisma.headsheet.findUnique({
            where: { id: delivery.headsheetId },
        });
        const head = await prisma.head.findUnique({
            where: { id: headsheet.head },
        });

        // const updatedDelivery = await prisma.deliveries.update({
        //     where: { id: deliveryId },
        //     data: { status: status },
        // });

        const updateDeliveryInfo = {
            deliveryId: deliveryId,
            status: status,
            districtName: district.name,
            headName: head.name,
            headsheetId: headsheet.id
        }

        await updateLogData(req.user.id, `Updated delivery ${deliveryId} to status ${status}`);

        res.status(200).json(updatedDelivery);
    } catch (error) {
        console.error('Error updating delivery:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}); 

export { updateDeliveries };