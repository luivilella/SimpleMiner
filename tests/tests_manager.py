# coding: utf8
import os
import unittest
from simpleminer.manager import MinerManager
from simpleminer.models import create_tables
from dbaggregator import DBAggregator
from simpleminer.models import TbConnection

dbs = {
    'db_conf': 'config/test_config.db',
    'db_miner': 'config/test_miner.db',
    'db_1': 'config/test_db_1.db',
    'db_2': 'config/test_db_2.db',
}
sqlite = 'sqlite:///{}'

class TestMinerManager(unittest.TestCase):


    def setUp(self):
        db = DBAggregator()

        for db_name, db_path in dbs.iteritems():
            try:
                os.remove(os.path.abspath(db_path))
            except OSError:
                pass

            db.add(db_name, sqlite.format(db_path))

        create_tables(db.db_conf.engine)

        self.mm = MinerManager(db_conf=db.db_conf, db_miner=db.db_miner)
        self.db = db


    def test_save_new_connection(self):
        name = 'SQLite Test1'
        str_conn = sqlite.format('config/db_configs.db')
        slug = 'test_connection'

        sess = self.db.db_conf.session()
        q = sess.query(TbConnection)
        q = q.filter(TbConnection.name == name)
        q = q.filter(TbConnection.string == str_conn)
        q = q.filter(TbConnection.slug == slug)

        self.assertIsNone(q.first())

        conn = self.mm.save_new_connection(name, str_conn, slug)
        self.assertTrue(isinstance(conn, TbConnection))

        self.assertIsNotNone(q.first())


    def create_dbs_test(self):
        db_1_conn = self.db.db_1.engine.connect()
        db_1_conn.execute('CREATE TABLE tb_client (id INTEGER PRIMARY KEY, name VARCHAR(255))')
        db_1_conn.execute('INSERT INTO tb_client (id, name) VALUES (1, "jhon")')
        db_1_conn.execute('INSERT INTO tb_client (id, name) VALUES (2, "alice")')
        db_1_conn.execute('INSERT INTO tb_client (id, name) VALUES (3, "maria")')
        self.mm.save_new_connection('DB1 test', sqlite.format(dbs['db_1']), 'db_1')

        db_2_conn = self.db.db_2.engine.connect()
        db_2_conn.execute('CREATE TABLE tb_sales (id INTEGER PRIMARY KEY, client_id INTEGER)')
        db_2_conn.execute('INSERT INTO tb_sales (id, client_id) VALUES (1, 1)')
        db_2_conn.execute('INSERT INTO tb_sales (id, client_id) VALUES (2, 1)')
        db_2_conn.execute('INSERT INTO tb_sales (id, client_id) VALUES (3, 2)')
        self.mm.save_new_connection('DB2 test', sqlite.format(dbs['db_1']), 'db_2')


    def test_save_new_miner(self):
        self.create_dbs_test()

        tb_miner = self.mm.save_new_miner(
            'db_1',
            '''
            SELECT
                id,
                name
            FROM tb_client
            ''',
            'Clients'
        )

        print tb_miner

if __name__ == '__main__':
    unittest.main()
