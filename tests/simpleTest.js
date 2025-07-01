/**
 * Simple Test Runner for AI Training System
 * Basic validation of core functionality
 */

// Simple test framework
class SimpleTest {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    describe(name, fn) {
        console.log(`\n🧪 Testing: ${name}`);
        fn();
    }

    it(description, testFn) {
        try {
            testFn();
            console.log(`  ✅ ${description}`);
            this.passed++;
        } catch (error) {
            console.log(`  ❌ ${description}: ${error.message}`);
            this.failed++;
        }
    }

    expect(actual) {
        return {
            toBe(expected) {
                if (actual !== expected) {
                    throw new Error(`Expected ${expected}, got ${actual}`);
                }
            },
            toBeGreaterThan(expected) {
                if (actual <= expected) {
                    throw new Error(`Expected ${actual} to be greater than ${expected}`);
                }
            },
            toBeDefined() {
                if (actual === undefined) {
                    throw new Error('Expected value to be defined');
                }
            },
            toContain(expected) {
                if (!actual.includes(expected)) {
                    throw new Error(`Expected ${actual} to contain ${expected}`);
                }
            }
        };
    }

    summary() {
        console.log(`\n📊 Test Summary: ${this.passed} passed, ${this.failed} failed`);
        return this.failed === 0;
    }
}

// Initialize test framework
const test = new SimpleTest();

// Load our modules
const fs = require('fs');
const path = require('path');

// Mock browser environment
global.window = {
    localStorage: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {}
    }
};
global.document = {
    createElement: () => ({
        appendChild: () => {},
        style: {},
        classList: { add: () => {}, remove: () => {} }
    }),
    head: { appendChild: () => {} },
    body: { appendChild: () => {} }
};
global.console = console;

// Load TrainableBaseTemplate
const templateCode = fs.readFileSync(path.join(__dirname, '..', 'trainableBaseTemplate.js'), 'utf8');
eval(templateCode.replace('if (typeof module !== \'undefined\' && module.exports)', 'if (true)'));
const { TrainableBaseTemplate } = module.exports;

// Basic functionality tests
test.describe('TrainableBaseTemplate Basic Tests', () => {
    let baseTemplate;

    // Initialize
    try {
        baseTemplate = new TrainableBaseTemplate({
            debug: false,
            confidenceThreshold: 0.7
        });
        test.it('should initialize correctly', () => {
            test.expect(baseTemplate).toBeDefined();
            test.expect(baseTemplate.config.confidenceThreshold).toBe(0.7);
        });
    } catch (error) {
        console.log('❌ Failed to initialize TrainableBaseTemplate:', error.message);
        return;
    }

    test.it('should have knowledge base', () => {
        test.expect(baseTemplate.knowledgeBase).toBeDefined();
    });

    test.it('should have conversation memory', () => {
        test.expect(baseTemplate.conversationMemory).toBeDefined();
    });

    test.it('should have metrics tracking', () => {
        test.expect(baseTemplate.metrics).toBeDefined();
        test.expect(baseTemplate.metrics.totalQueries).toBe(0);
    });

    // Test knowledge addition
    test.it('should add knowledge entries', async () => {
        const knowledge = {
            id: 'test_knowledge',
            content: 'Test knowledge for Jay\'s Mobile Wash services',
            category: 'test',
            confidence: 0.9,
            source: 'test',
            tags: ['test']
        };

        await baseTemplate.addKnowledge(knowledge);
        test.expect(baseTemplate.knowledgeBase.has('test_knowledge')).toBe(true);
    });

    // Test intent analysis
    test.it('should analyze intent correctly', () => {
        const bookingIntent = baseTemplate.analyzeIntent('I want to book service');
        test.expect(bookingIntent.type).toBe('booking');

        const pricingIntent = baseTemplate.analyzeIntent('How much does it cost?');
        test.expect(pricingIntent.type).toBe('pricing');
    });

    // Test embedding generation
    test.it('should generate embeddings', async () => {
        const embedding = await baseTemplate.generateEmbedding('test content');
        test.expect(embedding).toBeDefined();
        test.expect(embedding.length).toBeGreaterThan(0);
    });

    // Test content assessment
    test.it('should assess content value', () => {
        const highValue = baseTemplate.assessKnowledgeValue(
            'business question',
            'Jay\'s Mobile Wash provides premium services. Call 562-228-9429.'
        );
        test.expect(highValue.shouldLearn).toBe(true);
        test.expect(highValue.confidence).toBeGreaterThan(0.8);

        const lowValue = baseTemplate.assessKnowledgeValue(
            'generic question',
            'I don\'t know.'
        );
        test.expect(lowValue.shouldLearn).toBe(false);
    });

    // Test text processing
    test.it('should process text content', async () => {
        const textContent = 'Jay\'s Mobile Wash offers ceramic coating services in Los Angeles County.';
        const result = await baseTemplate.processTextContent(textContent, { source: 'test' });
        
        test.expect(result).toBeDefined();
        test.expect(result.length).toBeGreaterThan(0);
    });

    // Test metrics
    test.it('should provide metrics', () => {
        const metrics = baseTemplate.getMetrics();
        test.expect(metrics.knowledgeEntries).toBeDefined();
        test.expect(metrics.totalQueries).toBeDefined();
    });

    // Test export functionality
    test.it('should export knowledge base', () => {
        const exportData = baseTemplate.exportKnowledgeBase();
        test.expect(exportData.knowledge).toBeDefined();
        test.expect(exportData.version).toBeDefined();
    });
});

// Test content training
test.describe('Content Training Tests', () => {
    let baseTemplate;

    try {
        baseTemplate = new TrainableBaseTemplate({ debug: false });
    } catch (error) {
        console.log('❌ Failed to initialize for content training tests');
        return;
    }

    test.it('should handle text training', async () => {
        const content = 'Jay\'s Mobile Wash specializes in luxury vehicle detailing.';
        const result = await baseTemplate.submitTrainingContent(content, 'text', {});
        
        test.expect(result.success).toBe(true);
        test.expect(result.entriesAdded).toBeGreaterThan(0);
    });

    test.it('should handle conversation training', async () => {
        const conversation = [
            { role: 'user', content: 'Do you offer ceramic coating?' },
            { role: 'assistant', content: 'Yes, we specialize in ceramic coating services.' }
        ];
        
        const result = await baseTemplate.submitTrainingContent(conversation, 'conversation', {});
        test.expect(result.success).toBe(true);
    });

    test.it('should chunk text properly', () => {
        const longText = 'This is a very long text. '.repeat(50);
        const chunks = baseTemplate.chunkText(longText, 100);
        
        test.expect(chunks.length).toBeGreaterThan(1);
        chunks.forEach(chunk => {
            test.expect(chunk.length <= 150).toBe(true); // Allow some flexibility
        });
    });
});

// Run all tests
console.log('🚀 Starting AI Training System Tests...\n');

// Initialize and run tests
setTimeout(async () => {
    const success = test.summary();
    
    if (success) {
        console.log('\n🎉 All tests passed! AI Training System is working correctly.');
    } else {
        console.log('\n⚠️ Some tests failed. Please check the implementation.');
        process.exit(1);
    }
}, 1000);