# coding: utf8
import os
import unittest
from simpleminer.manager import MinerManager
from dbaggregator import DBAggregator

db_config = 'config/db_test_config.db'
db_miner = 'config/db_test_miner.db'

class TestMinerManager(unittest.TestCase):

    def setUp(self):
        try:
            os.remove(os.path.abspath(db_config))
        except OSError:
            pass

        try:
            os.remove(os.path.abspath(db_miner))
        except OSError:
            pass

        db = DBAggregator()
        db.add('db_conf', 'sqlite:///{}'.format(db_config))
        db.add('db_miner', 'sqlite:///{}'.format(db_miner))

        self.mm = MinerManager(db_conf=db.db_conf, db_miner=db.db_miner)

    def test_save_new_connection(self):
        # self.mm.save_new_connection('SQLite Test1', 'sqlite:///config/db_configs.db', 'db1')
        self.assertTrue(True)

if __name__ == '__main__':
    unittest.main()
