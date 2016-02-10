# coding: utf8
import unittest
from tests_manager import TestMinerManager

def suite_tests():
    suite = unittest.TestSuite()
    suite.addTest(TestMinerManager())

    return suite


if __name__ == '__main__':
    suite_tests().main()

