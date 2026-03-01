#!/usr/bin/env node

const { execSync } = require('child_process');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

// ANSI color codes as fallback if chalk not available
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
  try {
    return chalk[color](text);
  } catch {
    return colors[color] + text + colors.reset;
  }
}

console.log(colorize('\n🧪 Running All Tests for Exclusive Resorts\n', 'cyan'));
console.log('=' .repeat(60));

// Track test results
const testResults = {
  backend: {
    passed: 0,
    failed: 0,
    suites: []
  },
  frontend: {
    passed: 0,
    failed: 0,
    suites: []
  },
  utils: {
    passed: 0,
    failed: 0,
    suites: []
  }
};

// Define test categories
const testCategories = [
  {
    name: 'Backend (API Routes)',
    pattern: 'src/app/api/**/__tests__/*.test.ts',
    type: 'backend'
  },
  {
    name: 'Frontend Components',
    pattern: 'src/components/**/__tests__/*.test.tsx',
    type: 'frontend'
  },
  {
    name: 'Page Components',
    pattern: 'src/app/**/__tests__/*.test.tsx',
    type: 'frontend'
  },
  {
    name: 'Utilities',
    pattern: 'src/lib/**/__tests__/*.test.ts',
    type: 'utils'
  }
];

// Run tests for each category
testCategories.forEach(category => {
  console.log(colorize(`\n📁 ${category.name}`, 'blue'));
  console.log('-'.repeat(40));
  
  try {
    const output = execSync(
      `npx jest --testPathPattern="${category.pattern}" --json --outputFile=test-results-temp.json`, 
      { encoding: 'utf-8', stdio: 'pipe' }
    );
    
    // Read the JSON results
    const results = JSON.parse(fs.readFileSync('test-results-temp.json', 'utf-8'));
    
    // Process results
    results.testResults.forEach(suite => {
      const suiteName = path.relative(process.cwd(), suite.name);
      const passed = suite.numPassingTests;
      const failed = suite.numFailingTests;
      
      testResults[category.type].passed += passed;
      testResults[category.type].failed += failed;
      testResults[category.type].suites.push({
        name: suiteName,
        passed,
        failed,
        duration: suite.perfStats.runtime
      });
      
      if (failed > 0) {
        console.log(colorize(`  ❌ ${suiteName}`, 'red'));
        console.log(`     Passed: ${passed}, Failed: ${failed}`);
        
        // Show failed test names
        suite.testResults
          .filter(test => test.status === 'failed')
          .forEach(test => {
            console.log(colorize(`     ⨯ ${test.title}`, 'red'));
          });
      } else {
        console.log(colorize(`  ✅ ${suiteName}`, 'green'));
        console.log(`     Passed: ${passed} tests (${(suite.perfStats.runtime / 1000).toFixed(2)}s)`);
      }
    });
    
    // Clean up temp file
    fs.unlinkSync('test-results-temp.json');
    
  } catch (error) {
    console.log(colorize(`  ⚠️  Error running tests: ${error.message}`, 'yellow'));
    
    // Try to extract some info from the error output
    if (error.stdout) {
      const lines = error.stdout.split('\n');
      lines.forEach(line => {
        if (line.includes('FAIL') || line.includes('PASS')) {
          console.log(`     ${line.trim()}`);
        }
      });
    }
  }
});

// Generate summary report
console.log(colorize('\n\n📊 TEST SUMMARY', 'cyan'));
console.log('='.repeat(60));

const categories = [
  { name: 'Backend Tests', data: testResults.backend },
  { name: 'Frontend Tests', data: testResults.frontend },
  { name: 'Utility Tests', data: testResults.utils }
];

let totalPassed = 0;
let totalFailed = 0;

categories.forEach(({ name, data }) => {
  const total = data.passed + data.failed;
  totalPassed += data.passed;
  totalFailed += data.failed;
  
  console.log(`\n${name}:`);
  console.log(`  Total: ${total}`);
  console.log(colorize(`  ✓ Passed: ${data.passed}`, 'green'));
  
  if (data.failed > 0) {
    console.log(colorize(`  ✗ Failed: ${data.failed}`, 'red'));
  }
  
  if (data.suites.length > 0) {
    console.log(`  Test Suites: ${data.suites.length}`);
  }
});

// Overall summary
console.log(colorize('\n\n🎯 OVERALL RESULTS', 'cyan'));
console.log('='.repeat(60));

const grandTotal = totalPassed + totalFailed;
const passRate = grandTotal > 0 ? ((totalPassed / grandTotal) * 100).toFixed(1) : 0;

console.log(`Total Tests: ${grandTotal}`);
console.log(colorize(`✓ Passed: ${totalPassed}`, 'green'));
console.log(colorize(`✗ Failed: ${totalFailed}`, totalFailed > 0 ? 'red' : 'green'));
console.log(`Pass Rate: ${passRate}%`);

// Generate detailed report file
const reportContent = {
  timestamp: new Date().toISOString(),
  summary: {
    total: grandTotal,
    passed: totalPassed,
    failed: totalFailed,
    passRate: passRate + '%'
  },
  categories: testResults,
  details: []
};

// Add detailed results for each category
Object.entries(testResults).forEach(([category, data]) => {
  data.suites.forEach(suite => {
    reportContent.details.push({
      category,
      suite: suite.name,
      passed: suite.passed,
      failed: suite.failed,
      duration: suite.duration
    });
  });
});

// Write detailed report
fs.writeFileSync(
  'test-report.json',
  JSON.stringify(reportContent, null, 2),
  'utf-8'
);

console.log(colorize('\n\n📄 Detailed report saved to: test-report.json', 'cyan'));

// Exit with appropriate code
if (totalFailed > 0) {
  console.log(colorize('\n❌ Tests failed! Please fix the failing tests.', 'red'));
  process.exit(1);
} else {
  console.log(colorize('\n✅ All tests passed!', 'green'));
  process.exit(0);
}
