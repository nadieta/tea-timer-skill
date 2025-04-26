#!/bin/bash
# Deployment script for Tea Timer Alexa Skill

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Deploying Tea Timer Skill...${NC}"

# Check if ASK CLI is installed
if ! command -v ask &> /dev/null; then
    echo -e "${RED}Error: ASK CLI is not installed.${NC}"
    echo "Please install ASK CLI using: npm install -g ask-cli"
    exit 1
fi

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
cd lambda
npm install
cd ..

# Deploy the skill
echo -e "${YELLOW}Deploying skill...${NC}"
ask deploy

# Check if deployment was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Deployment successful!${NC}"
    echo -e "${YELLOW}Testing the skill...${NC}"
    
    # Run a quick test
    cd lambda
    npm test
    cd ..
    
    echo -e "${GREEN}Deployment and testing completed.${NC}"
    echo "You can now test your skill in the Alexa Developer Console or on your Echo device."
else
    echo -e "${RED}Deployment failed!${NC}"
    echo "Please check the error messages above."
fi

exit 0 