import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'abonnements'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('companie_id')
        .references('id')
        .inTable('companies')
        .nullable()
        .onDelete('CASCADE')
      table.integer('user_id').references('id').inTable('users').nullable().onDelete('CASCADE')
      table.integer('pack_id').references('id').inTable('packs').nullable().onDelete('CASCADE')
      table.string('pack_libelle').nullable()
      table.text('pack_description').nullable()
      table.integer('pack_montant').nullable()
      table.timestamp('date_debut').nullable()
      table.timestamp('date_fin').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
