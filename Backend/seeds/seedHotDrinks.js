import pool from "../db/pool.js";

const NEW_DRINKS = [
    { item_name: "Hot Caramel Latte", item_cost: 5.49, item_type: "Hot Drinks" },
    { item_name: "Hot Mocha", item_cost: 5.99, item_type: "Hot Drinks" },
    { item_name: "Espresso", item_cost: 3.99, item_type: "Hot Drinks" },
    { item_name: "Vanilla Chai Latte", item_cost: 5.49, item_type: "Hot Drinks" },
    { item_name: "Masala Chai", item_cost: 4.99, item_type: "Hot Drinks" },
    { item_name: "London Fog", item_cost: 5.49, item_type: "Hot Drinks" },

    { item_name: "Mango Slushie", item_cost: 5.49, item_type: "Slushies" },
    { item_name: "Strawberry Slushie", item_cost: 5.49, item_type: "Slushies" },
    { item_name: "Blue Raspberry Slushie", item_cost: 5.49, item_type: "Slushies" },
];

async function seed() {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        let inserted = 0;
        let skipped = 0;

        for (const drink of NEW_DRINKS) {
            const exists = await client.query(
                "SELECT 1 FROM menu WHERE LOWER(item_name) = LOWER($1) LIMIT 1",
                [drink.item_name]
            );

            if (exists.rows.length > 0) {
                console.log(` Skipped (already exists): ${drink.item_name}`);
                skipped++;
                continue;
            }

            const maxID = await client.query(
                "SELECT COALESCE(MAX(menu_item_id), 0) AS mid FROM menu"
            );
            const nextID = Number(maxID.rows[0].mid) + 1;

            await client.query(
                `INSERT INTO menu (menu_item_id, item_name, item_cost, item_type)
         VALUES ($1, $2, $3, $4)`,
                [nextID, drink.item_name, drink.item_cost, drink.item_type]
            );

            console.log(` Inserted: ${drink.item_name} → ${drink.item_type} (id: ${nextID}, $${drink.item_cost})`);
            inserted++;
        }

        await client.query("COMMIT");
        console.log(`\n🎉 Done! Inserted: ${inserted}, Skipped: ${skipped}`);
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("Seed failed, rolled back:", err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

seed();
