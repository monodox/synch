import { createSynch } from '../src';

// Example: Simulating AI inference with computation reuse
async function main() {
  // Create Synch instance with configuration
  const synch = createSynch({
    cache: {
      enabled: true,
      maxSize: 100,
      ttl: 60000, // 1 minute
    },
    runtime: {
      maxConcurrency: 5,
      timeout: 10000, // 10 seconds
    },
  });

  // Define a simulated AI task (e.g., text classification)
  const classifyText = async (text: string): Promise<string> => {
    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simple classification logic
    if (text.toLowerCase().includes('happy')) return 'positive';
    if (text.toLowerCase().includes('sad')) return 'negative';
    return 'neutral';
  };

  console.log('=== Synch Basic Example ===\n');

  // First execution - will compute
  console.log('1. First execution (will compute):');
  const result1 = await synch.run(
    { input: 'I am happy today!' },
    classifyText
  );
  console.log(`   Result: ${result1.output}`);
  console.log(`   Cached: ${result1.cached}`);
  console.log(`   Time: ${result1.executionTime}ms\n`);

  // Second execution with same input - will use cache
  console.log('2. Second execution with same input (will use cache):');
  const result2 = await synch.run(
    { input: 'I am happy today!' },
    classifyText
  );
  console.log(`   Result: ${result2.output}`);
  console.log(`   Cached: ${result2.cached}`);
  console.log(`   Time: ${result2.executionTime}ms\n`);

  // Third execution with different input - will compute
  console.log('3. Third execution with different input (will compute):');
  const result3 = await synch.run(
    { input: 'I am sad today.' },
    classifyText
  );
  console.log(`   Result: ${result3.output}`);
  console.log(`   Cached: ${result3.cached}`);
  console.log(`   Time: ${result3.executionTime}ms\n`);

  // Get statistics
  console.log('=== Statistics ===');
  const stats = synch.getStats();
  console.log(`Cache Hits: ${stats.cacheHits}`);
  console.log(`Cache Misses: ${stats.cacheMisses}`);
  console.log(`Total Executions: ${stats.totalExecutions}`);
  console.log(`Cache Size: ${stats.cacheSize}`);
  console.log(`Hit Rate: ${((stats.cacheHits / stats.totalExecutions) * 100).toFixed(2)}%`);
}

main().catch(console.error);
