import { BaseSchema } from '@adonisjs/lucid/schema'

export default class AddDateOperationToDepenses extends BaseSchema {
  protected tableName = 'depenses'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .date('date_operation')
        .notNullable()
        .defaultTo(this.raw('CURRENT_DATE'))
        .after('montant')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('date_operation')
    })
  }
}
