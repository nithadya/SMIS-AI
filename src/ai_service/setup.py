from setuptools import setup, find_packages

setup(
    name="ai_service",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "numpy>=1.21.0",
        "pandas>=1.3.0",
        "scikit-learn>=1.0.0",
        "joblib>=1.1.0",
        "python-dotenv>=0.19.0"
    ],
) 