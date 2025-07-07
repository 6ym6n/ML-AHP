# ML-AHP
A Hybrid Decision-Making System Combining Machine Learning and AHP for Criteria Evaluation and Prioritization

# ML-AHP: Machine Learning Analytic Hierarchy Process

ML-AHP combines Machine Learning techniques with the Analytic Hierarchy Process (AHP) to enhance decision-making by automating the weighting of criteria and ranking of alternatives.

## Overview

The Analytic Hierarchy Process (AHP) is a structured decision-making method that helps prioritize criteria and alternatives through a hierarchical framework. ML-AHP leverages machine learning to automate the evaluation of criteria weights and alternative rankings, making the decision process more efficient and less subject to bias.

## Features

- **Automated Criteria Weighting:** Uses machine learning algorithms to calculate the relative importance of each criterion.
- **Alternative Ranking:** Evaluates and ranks decision alternatives based on weighted criteria.
- **Full-Stack Web Interface:** A Django-powered backend combined with a Vite + React frontend for a fast and interactive experience.

## Installation

### Backend Setup

1. **Clone the Repository**

   ```bash
   git clone https://github.com/6ym6n/ML-AHP.git
   cd ML-AHP/app/myproject
   ```

2. **Create and Activate a Virtual Environment** (optional but recommended):

   ```bash
   python3 -m venv env
   source env/bin/activate  # On Windows: env\Scripts\activate
   ```

3. **Install Dependencies**

   ```bash
   pip install -r requirements.txt
   ```

4. **Apply Migrations**

   ```bash
   python manage.py migrate
   ```

5. **Start the Django Development Server**

   ```bash
   python manage.py runserver
   ```

   The backend server will typically run on [http://localhost:8000/](http://localhost:8000/).

### Frontend Setup (Vite + React)

1. **Navigate to the Frontend Directory**

   Open a new terminal window/tab and run:

   ```bash
   cd ML-AHP/app/myfrontend
   ```

2. **Install Dependencies**

   Ensure you have Node.js and npm installed, then run:

   ```bash
   npm install
   ```

3. **Start the Vite Development Server**

   ```bash
   npm run dev
   ```

   The Vite-powered React app will typically run on [http://localhost:5173/](http://localhost:5173/).

## Usage

1. **Access the Web Application:**  
   Open your browser and navigate to the React application's URL. The interface allows you to input decision criteria and alternatives.

2. **Submit Your Data:**  
   The data is processed by the Django backend using machine learning methods combined with AHP to rank alternatives.

3. **View the Results:**  
   Results are displayed on the frontend, presenting a ranked list of alternatives based on the computed weights.

## Contributing

Contributions are welcome! Please fork the repository, make your changes, and submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## References

- [Analytic Hierarchy Process (AHP)](https://www.1000minds.com/decision-making/analytic-hierarchy-process-ahp)
```
