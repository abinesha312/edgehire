import unittest
import json
from model import app  # Import the Flask app instance correctly

class TestFlaskApp(unittest.TestCase):
    
    def setUp(self):
        self.app = app.test_client() 
        self.app.testing = True

    def test_ask_question(self):
        sample_question = {
            'question': 'What are some common interview questions for software developers?'
        }
        print("Reached here : - 1")
        response = self.app.post('/ask', data=json.dumps(sample_question), content_type='application/json')
        print("Reached here : - 1",response)
        self.assertEqual(response.status_code, 200, f"Unexpected status code: {response.status_code}")
        try:
            data = json.loads(response.data)
        except json.JSONDecodeError as e:
            self.fail(f"Response data is not valid JSON: {e}")
        self.assertIn('response', data, "Response key not found in JSON response")
        
        print('Response:', data['response'])
        
if __name__ == '__main__':
    unittest.main()