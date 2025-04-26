#!/bin/bash
# Setup and deployment script for Tea Timer Alexa Skill

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Setting up and deploying Tea Timer Skill...${NC}"

# Check if ASK CLI is installed
if ! command -v ask &> /dev/null; then
    echo -e "${YELLOW}ASK CLI not found. Installing...${NC}"
    npm install -g ask-cli
else
    echo -e "${GREEN}ASK CLI is already installed.${NC}"
fi

# Set up ASK CLI
echo -e "${YELLOW}Setting up ASK CLI...${NC}"
echo -e "${YELLOW}You will be asked to log in to your Amazon Developer account.${NC}"
echo -e "${YELLOW}A browser window should open. If not, follow the instructions in the terminal.${NC}"
echo -e "${YELLOW}Press any key to continue...${NC}"
read -n 1 -s

# Run the ASK profile creation
ask init --no-browser

# Check Lambda configuration
echo -e "${YELLOW}Checking Lambda configuration...${NC}"
if grep -q "XXXXXXXXXXXX" "/Users/nads/tea-timer-skill/skill.json"; then
    echo -e "${RED}Warning: Lambda ARN in skill.json contains placeholder values.${NC}"
    echo -e "${YELLOW}You need to update the Lambda ARN in skill.json with your actual AWS Lambda ARN.${NC}"
    echo -e "${YELLOW}Do you have an existing Lambda function for this skill? (y/n)${NC}"
    read -n 1 lambda_exists
    
    if [ "$lambda_exists" = "y" ]; then
        echo ""
        echo -e "${YELLOW}Please enter your Lambda ARN (e.g., arn:aws:lambda:us-east-1:123456789012:function:tea-timer-skill):${NC}"
        read lambda_arn
        
        # Replace placeholder ARN in skill.json
        sed -i '' "s|arn:aws:lambda:us-east-1:XXXXXXXXXXXX:function:tea-timer-skill|$lambda_arn|g" "/Users/nads/tea-timer-skill/skill.json"
        sed -i '' "s|arn:aws:lambda:us-east-1:XXXXXXXXXXXX:function:tea-timer-skill|$lambda_arn|g" "/Users/nads/tea-timer-skill/ask-cli.json"
        
        echo -e "${GREEN}Lambda ARN updated in configuration files.${NC}"
    else
        echo ""
        echo -e "${YELLOW}We'll create a new Lambda function during deployment.${NC}"
    fi
fi

# Prepare the Lambda package
echo -e "${YELLOW}Preparing Lambda package...${NC}"
cd lambda
npm install
cd ..

# Deploy with ASK CLI
echo -e "${YELLOW}Deploying skill with ASK CLI...${NC}"
ask deploy

# Check if deployment was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Deployment successful!${NC}"
    echo -e "${YELLOW}You can now test your skill on your Echo Show device by saying:${NC}"
    echo -e "${GREEN}\"Alexa, open Tea Timer\"${NC}"
else
    echo -e "${RED}Deployment failed!${NC}"
    echo "Please check the error messages above."
fi

exit 0 