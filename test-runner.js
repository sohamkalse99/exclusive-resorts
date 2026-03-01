#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function colorize(text, color) {
  return colors[color] + text + colors.reset;
}

console.log(colorize('\n🧪 EXCLUSIVE RESORTS - TEST RUNNER\n', 'cyan'));
console.log('=' .repeat(60));

// Function to run tests
function runTests() {
  console.log('\nRunning all tests...\n');
  
  try {
    // Run Jest with coverage
    const output = execSync('npm test -- --coverage --ci --silent --json 2>&1', {
      encoding: 'utf-8',
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    });
    
    // Parse the last JSON line from output
    const lines = output.split('\n').filter(line => line.trim());
    const jsonLine = lines.find(line => line.startsWith('{'));
    
    if (jsonLine) {
      const results = JSON.parse(jsonLine);
      displayResults(results);
      return results.success;
    } else {
      // Fallback: run without JSON output
      console.log(colorize('Running tests in verbose mode...', 'yellow'));
      const verboseOutput = execSync('npm test -- --coverage', {
        encoding: 'utf-8',
        stdio: 'inherit'
      });
      return true;
    }
  } catch (error) {
    // If JSON parsing fails, try to run tests normally
    console.log(colorize('Running tests with standard output...', 'yellow'));
    
    try {
      execSync('npm test -- --coverage', {
        stdio: 'inherit'
      });
      return true;
    } catch (testError) {
      console.log(colorize('\n❌ Tests failed!', 'red'));
      return false;
    }
  }
}

function displayResults(results) {
  console.log(colorize('\n📊 TEST RESULTS\n', 'cyan'));
  console.log('-'.repeat(60));
  
  // Overall stats
  console.log(`${colorize('Test Suites:', 'bold')} ${results.numFailedTestSuites} failed, ${results.numPassedTestSuites} passed, ${results.numTotalTestSuites} total`);
  console.log(`${colorize('Tests:', 'bold')}       ${results.numFailedTests} failed, ${results.numPassedTests} passed, ${results.numTotalTests} total`);
  console.log(`${colorize('Time:', 'bold')}        ${((results.testResults[0]?.endTime - results.testResults[0]?.startTime) / 1000).toFixed(2)}s`);
  
  // Group results by category
  const categories = {
    backend: [],
    frontend: [],
    utils: []
  };
  
  results.testResults.forEach(suite => {
    const relativePath = path.relative(process.cwd(), suite.name);
    
    if (relativePath.includes('api')) {
      categories.backend.push(suite);
    } else if (relativePath.includes('components') || relativePath.includes('app') && !relativePath.includes('api')) {
      categories.frontend.push(suite);
    } else {
      categories.utils.push(suite);
    }
  });
  
  // Display by category
  console.log(colorize('\n\n📁 BACKEND TESTS (API Routes)', 'blue'));
  console.log('-'.repeat(40));
  displayCategoryResults(categories.backend);
  
  console.log(colorize('\n\n📁 FRONTEND TESTS (Components & Pages)', 'blue'));
  console.log('-'.repeat(40));
  displayCategoryResults(categories.frontend);
  
  console.log(colorize('\n\n📁 UTILITY TESTS', 'blue'));
  console.log('-'.repeat(40));
  displayCategoryResults(categories.utils);
  
  // Coverage summary if available
  if (results.coverageMap) {
    console.log(colorize('\n\n📈 COVERAGE SUMMARY', 'cyan'));
    console.log('-'.repeat(40));
    console.log('Coverage data available in coverage/lcov-report/index.html');
  }
}

function displayCategoryResults(suites) {
  if (suites.length === 0) {
    console.log('  No tests in this category');
    return;
  }
  
  let totalPassed = 0;
  let totalFailed = 0;
  
  suites.forEach(suite => {
    const relativePath = path.relative(process.cwd(), suite.name);
    const passed = suite.numPassingTests;
    const failed = suite.numFailingTests;
    
    totalPassed += passed;
    totalFailed += failed;
    
    if (failed > 0) {
      console.log(colorize(`  ❌ ${relativePath}`, 'red'));
      console.log(`     ${passed} passed, ${colorize(failed + ' failed', 'red')}`);
      
      // Show failed tests
      suite.testResults
        .filter(test => test.status === 'failed')
        .forEach(test => {
          console.log(colorize(`       ⨯ ${test.title}`, 'red'));
        });
    } else {
      console.log(colorize(`  ✅ ${relativePath}`, 'green'));
      console.log(`     ${passed} passed (${(suite.perfStats.runtime / 1000).toFixed(2)}s)`);
    }
  });
  
  console.log(`\n  Category Total: ${colorize(totalPassed + ' passed', 'green')}, ${totalFailed > 0 ? colorize(totalFailed + ' failed', 'red') : '0 failed'}`);
}

// Simple test check script
function quickCheck() {
  console.log('\nPerforming quick test check...\n');
  
  const testFiles = [
    // Backend tests
    { 
      path: 'src/app/api/proposals/__tests__/route.test.ts', 
      type: 'Backend',
      desc: 'Proposals API'
    },
    { 
      path: 'src/app/api/proposals/[id]/__tests__/route.test.ts', 
      type: 'Backend',
      desc: 'Proposal Details API'
    },
    { 
      path: 'src/app/api/reservations/__tests__/route.test.ts', 
      type: 'Backend',
      desc: 'Reservations API'
    },
    // Frontend tests
    { 
      path: 'src/components/concierge/__tests__/ReservationHeader.test.tsx', 
      type: 'Frontend',
      desc: 'ReservationHeader Component'
    },
    { 
      path: 'src/components/concierge/__tests__/CategoryCards.test.tsx', 
      type: 'Frontend',
      desc: 'CategoryCards Component'
    },
    { 
      path: 'src/components/concierge/__tests__/AddItemForm.test.tsx', 
      type: 'Frontend',
      desc: 'AddItemForm Component'
    },
    { 
      path: 'src/components/concierge/__tests__/LineItemsList.test.tsx', 
      type: 'Frontend',
      desc: 'LineItemsList Component'
    },
    { 
      path: 'src/components/concierge/__tests__/ProposalsList.test.tsx', 
      type: 'Frontend',
      desc: 'ProposalsList Component'
    },
    // Page tests
    { 
      path: 'src/app/__tests__/page.test.tsx', 
      type: 'Frontend',
      desc: 'Concierge Dashboard Page'
    },
    { 
      path: 'src/app/proposal/[id]/__tests__/page.test.tsx', 
      type: 'Frontend',
      desc: 'Proposal View Page'
    },
    // Utility tests
    { 
      path: 'src/lib/__tests__/utils.test.ts', 
      type: 'Utility',
      desc: 'Utility Functions'
    }
  ];
  
  console.log(colorize('📋 TEST FILES STATUS\n', 'cyan'));
  
  const summary = {
    backend: { found: 0, missing: 0 },
    frontend: { found: 0, missing: 0 },
    utility: { found: 0, missing: 0 }
  };
  
  testFiles.forEach(({ path, type, desc }) => {
    const exists = fs.existsSync(path);
    const typeKey = type.toLowerCase();
    
    if (exists) {
      console.log(colorize(`  ✅ [${type}] ${desc}`, 'green'));
      console.log(`     ${path}`);
      summary[typeKey].found++;
    } else {
      console.log(colorize(`  ❌ [${type}] ${desc} - NOT FOUND`, 'red'));
      console.log(`     Expected at: ${path}`);
      summary[typeKey].missing++;
    }
  });
  
  console.log(colorize('\n\n📊 FILE SUMMARY', 'cyan'));
  console.log('-'.repeat(40));
  console.log(`Backend Tests:  ${summary.backend.found} found, ${summary.backend.missing} missing`);
  console.log(`Frontend Tests: ${summary.frontend.found} found, ${summary.frontend.missing} missing`);
  console.log(`Utility Tests:  ${summary.utility.found} found, ${summary.utility.missing} missing`);
  
  const totalFound = summary.backend.found + summary.frontend.found + summary.utility.found;
  const totalExpected = testFiles.length;
  
  console.log(`\nTotal: ${totalFound}/${totalExpected} test files found`);
}

// Main execution
console.log('1. Checking test files...');
quickCheck();

console.log('\n' + '='.repeat(60));
console.log('\n2. Running all tests...');

const success = runTests();

console.log('\n' + '='.repeat(60));

if (success) {
  console.log(colorize('\n✅ ALL TESTS COMPLETED SUCCESSFULLY!\n', 'green'));
} else {
  console.log(colorize('\n❌ SOME TESTS FAILED!\n', 'red'));
  console.log('Please review the output above and fix any failing tests.');
}

console.log('\nTo run tests again: node test-runner.js');
console.log('To run with watch mode: npm run test:watch');
console.log('To see coverage report: npm run test:coverage\n');
