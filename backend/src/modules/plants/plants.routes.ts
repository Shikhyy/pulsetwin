import { FastifyInstance } from 'fastify';
import { db } from '../../db/connection.js';
import { plants, lines, zones, stations } from '../../db/schema.js';
import { eq } from 'drizzle-orm';

export async function plantsRoutes(fastify: FastifyInstance) {
  fastify.get('/', async (request, reply) => {
    return await db.select().from(plants);
  });

  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    
    const plantList = await db.select().from(plants).where(eq(plants.id, id));
    if (plantList.length === 0) return reply.status(404).send({ error: 'Not found' });
    const plant = plantList[0];

    const lineList = await db.select().from(lines).where(eq(lines.plantId, plant.id));
    
    // In a real app we'd fetch zones/stations in nested queries or joins. 
    // Sending basic layout info for the first line.
    let fullLayout = null;
    if (lineList.length > 0) {
      const line = lineList[0];
      const zoneList = await db.select().from(zones).where(eq(zones.lineId, line.id));
      const stationList = await db.select().from(stations);
      
      fullLayout = {
        line,
        zones: zoneList.map(z => ({
          ...z,
          stations: stationList.filter(s => s.zoneId === z.id)
        }))
      };
    }

    return {
      plant,
      layout: fullLayout
    };
  });
}
