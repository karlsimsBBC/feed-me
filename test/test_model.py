import unittest
from unittest.mock import Mock
from unittest.mock import mock_open
from contextlib import contextmanager


class TestDocumentDB(unittest.TestCase):

    def test_reads_articles(self):
        db = DocumentDB()
        expected = [
            {'article_idx': 0},
            {'article_idx': 1}
        ]
        self.assertEquals(db.read('articles'), expected)

    def test_writes_atricle(self):
        db = DocumentDB()
        self.assertEquals(db.read('articles'), [])
        db.write({'article_idx': 0})
        expected = [
            {'article_idx': 0}
        ]
        
            actual = db.read('articles')
        self.assertEquals(db.read('articles'), expected)

    def test_skips_write_when_article_exists(self):
        db = DocumentDB()
        self.assertEquals(db.read('articles'), [])
        db.write({'article_idx': 0})
        db.write({'article_idx': 0})
        expected = [
            {'article_idx': 0}
        ]
        self.assertEquals(db.read('articles'), expected)

@contextmanager
def mock_files(data):
    f = mock_open(read_data=data)
    with mock.patch("__builtin__.open", f) as fs:
        yield fs

MOCK_DATA_A = ''
MOCK_DATA_B = '{"article_idx": 0}\n{"article_idx": 1}\n"