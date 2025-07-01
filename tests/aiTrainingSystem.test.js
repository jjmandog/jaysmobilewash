/**
 * Test Suite for Jay's Mobile Wash - Intelligent AI Training System
 * 
 * Comprehensive tests for TrainableBaseTemplate, content ingestion,
 * learning capabilities, and training interface functionality.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock localStorage for testing
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Import modules (these would be imported in a real test environment)
// For now, we'll assume they're available globally
const { TrainableBaseTemplate } = require('./trainableBaseTemplate.js');
const { ChatWidget } = require('./chatWidget.js');

describe('TrainableBaseTemplate', () => {
    let baseTemplate;

    beforeEach(async () => {
        // Clear localStorage mocks
        localStorageMock.getItem.mockClear();
        localStorageMock.setItem.mockClear();
        localStorageMock.removeItem.mockClear();
        
        // Initialize base template
        baseTemplate = new TrainableBaseTemplate({
            debug: false,
            confidenceThreshold: 0.7,
            maxKnowledgeEntries: 1000
        });
        
        await baseTemplate.init();
    });

    afterEach(() => {
        if (baseTemplate) {
            baseTemplate.clearKnowledgeBase();
        }
    });

    describe('Initialization', () => {
        it('should initialize with default configuration', () => {
            expect(baseTemplate.config.confidenceThreshold).toBe(0.7);
            expect(baseTemplate.config.maxKnowledgeEntries).toBe(1000);
            expect(baseTemplate.knowledgeBase).toBeDefined();
            expect(baseTemplate.conversationMemory).toBeDefined();
        });

        it('should load core business knowledge', () => {
            expect(baseTemplate.knowledgeBase.size).toBeGreaterThan(0);
            
            // Check for core knowledge entries
            let hasBusinessInfo = false;
            for (const [id, knowledge] of baseTemplate.knowledgeBase) {
                if (knowledge.category === 'business_info') {
                    hasBusinessInfo = true;
                    break;
                }
            }
            expect(hasBusinessInfo).toBe(true);
        });

        it('should initialize metrics tracking', () => {
            expect(baseTemplate.metrics).toBeDefined();
            expect(baseTemplate.metrics.totalQueries).toBe(0);
            expect(baseTemplate.metrics.knowledgeEntries).toBeGreaterThan(0);
        });
    });

    describe('Knowledge Management', () => {
        it('should add knowledge entries correctly', async () => {
            const knowledge = {
                id: 'test_knowledge',
                content: 'Test knowledge content for ceramic coating services',
                category: 'services',
                confidence: 0.9,
                source: 'test',
                tags: ['ceramic', 'coating']
            };

            await baseTemplate.addKnowledge(knowledge);
            
            expect(baseTemplate.knowledgeBase.has('test_knowledge')).toBe(true);
            expect(baseTemplate.knowledgeBase.get('test_knowledge').content).toBe(knowledge.content);
        });

        it('should generate embeddings for knowledge', async () => {
            const knowledge = {
                id: 'embedding_test',
                content: 'Mobile detailing services in Los Angeles',
                category: 'services',
                confidence: 0.8,
                source: 'test',
                tags: ['mobile', 'detailing']
            };

            await baseTemplate.addKnowledge(knowledge);
            
            const storedKnowledge = baseTemplate.knowledgeBase.get('embedding_test');
            expect(storedKnowledge.embedding).toBeDefined();
            expect(Array.isArray(storedKnowledge.embedding)).toBe(true);
            expect(storedKnowledge.embedding.length).toBe(baseTemplate.config.embeddingDimensions);
        });

        it('should search knowledge base by similarity', async () => {
            // Add test knowledge
            await baseTemplate.addKnowledge({
                id: 'ceramic_coating_info',
                content: 'Ceramic coating provides long-lasting protection for your vehicle',
                category: 'services',
                confidence: 0.9,
                source: 'test',
                tags: ['ceramic', 'coating', 'protection']
            });

            const results = await baseTemplate.searchKnowledgeBase('ceramic coating service');
            
            expect(results.length).toBeGreaterThan(0);
            expect(results[0].similarity).toBeGreaterThan(0);
            expect(results[0].content).toContain('ceramic coating');
        });
    });

    describe('Response Generation', () => {
        beforeEach(async () => {
            // Add test knowledge for response generation
            await baseTemplate.addKnowledge({
                id: 'booking_info',
                content: 'For scheduling and quotes, please call 562-228-9429. We offer same-day availability.',
                category: 'booking',
                confidence: 1.0,
                source: 'test',
                tags: ['booking', 'scheduling', 'phone']
            });

            await baseTemplate.addKnowledge({
                id: 'pricing_info',
                content: 'Our pricing starts at $70 for basic packages, with full detail packages priced based on vehicle size.',
                category: 'pricing',
                confidence: 0.9,
                source: 'test',
                tags: ['pricing', 'packages']
            });
        });

        it('should generate responses for booking queries', async () => {
            const response = await baseTemplate.generateResponse('I want to book an appointment');
            
            expect(response.shouldUseExternalAPI).toBe(false);
            expect(response.confidence).toBeGreaterThanOrEqual(0.7);
            expect(response.response).toContain('562-228-9429');
        });

        it('should generate responses for pricing queries', async () => {
            const response = await baseTemplate.generateResponse('How much does car detailing cost?');
            
            expect(response.shouldUseExternalAPI).toBe(false);
            expect(response.confidence).toBeGreaterThanOrEqual(0.7);
            expect(response.response).toContain('$70');
        });

        it('should fall back to external API for low confidence', async () => {
            const response = await baseTemplate.generateResponse('What is quantum physics?');
            
            expect(response.shouldUseExternalAPI).toBe(true);
            expect(response.confidence).toBeLessThan(0.7);
        });

        it('should analyze intent correctly', () => {
            expect(baseTemplate.analyzeIntent('I want to book service').type).toBe('booking');
            expect(baseTemplate.analyzeIntent('How much does it cost?').type).toBe('pricing');
            expect(baseTemplate.analyzeIntent('What services do you offer?').type).toBe('services');
            expect(baseTemplate.analyzeIntent('Do you serve my area?').type).toBe('location');
        });
    });

    describe('Learning System', () => {
        it('should learn from external API responses', async () => {
            const userQuery = 'What is paint correction?';
            const externalResponse = 'Paint correction is a process that removes swirl marks and scratches from your vehicle\'s paint surface, restoring its original shine and clarity.';
            
            const initialKnowledgeCount = baseTemplate.knowledgeBase.size;
            
            await baseTemplate.learnFromExternalResponse(userQuery, externalResponse, 'test_api');
            
            expect(baseTemplate.metrics.learningEvents).toBeGreaterThan(0);
            expect(baseTemplate.knowledgeBase.size).toBeGreaterThanOrEqual(initialKnowledgeCount);
        });

        it('should assess knowledge value correctly', () => {
            const highValueAssessment = baseTemplate.assessKnowledgeValue(
                'services question',
                'Jay\'s Mobile Wash offers premium ceramic coating and paint correction services in Los Angeles.'
            );
            expect(highValueAssessment.shouldLearn).toBe(true);
            expect(highValueAssessment.confidence).toBeGreaterThan(0.8);

            const lowValueAssessment = baseTemplate.assessKnowledgeValue(
                'generic question',
                'I don\'t know the answer to that question.'
            );
            expect(lowValueAssessment.shouldLearn).toBe(false);
        });

        it('should extract key information from responses', () => {
            const response = 'Jay\'s Mobile Wash provides ceramic coating services starting at $300 for sedans in Los Angeles County.';
            const keyInfo = baseTemplate.extractKeyInformation(response);
            
            expect(keyInfo).toBeDefined();
            expect(keyInfo.category).toBe('pricing');
            expect(keyInfo.tags).toContain('ceramic');
            expect(keyInfo.tags).toContain('coating');
        });

        it('should maintain conversation memory', async () => {
            await baseTemplate.generateResponse('Hello, I need car detailing');
            await baseTemplate.generateResponse('What are your prices?');
            
            expect(baseTemplate.conversationMemory.length).toBeGreaterThan(0);
            expect(baseTemplate.conversationMemory[0].role).toBe('user');
        });
    });

    describe('Content Training', () => {
        it('should process text content training', async () => {
            const textContent = 'Jay\'s Mobile Wash specializes in luxury vehicle detailing using premium Koch Chemie products. We serve Beverly Hills, Santa Monica, and surrounding areas with our mobile service.';
            
            const result = await baseTemplate.submitTrainingContent(textContent, 'text', {
                source: 'business_manual'
            });
            
            expect(result.success).toBe(true);
            expect(result.entriesAdded).toBeGreaterThan(0);
        });

        it('should process video transcript training', async () => {
            const transcript = 'In this training video, we demonstrate the proper technique for applying ceramic coating to ensure maximum durability and shine. First, prepare the surface by thoroughly cleaning...';
            
            const result = await baseTemplate.submitTrainingContent(transcript, 'video', {
                title: 'Ceramic Coating Application',
                source: 'training_video'
            });
            
            expect(result.success).toBe(true);
            expect(result.entriesAdded).toBeGreaterThan(0);
        });

        it('should process conversation training', async () => {
            const conversation = [
                { role: 'user', content: 'Do you offer paint correction?' },
                { role: 'assistant', content: 'Yes, we specialize in paint correction services to remove swirl marks and restore your paint\'s clarity.' },
                { role: 'user', content: 'How long does it take?' },
                { role: 'assistant', content: 'Paint correction typically takes 4-8 hours depending on the vehicle size and paint condition.' }
            ];
            
            const result = await baseTemplate.submitTrainingContent(conversation, 'conversation', {
                source: 'customer_chat'
            });
            
            expect(result.success).toBe(true);
            expect(result.entriesAdded).toBeGreaterThan(0);
        });

        it('should assess text chunk value correctly', () => {
            const businessContent = baseTemplate.assessTextChunkValue(
                'Jay\'s Mobile Wash provides premium mobile detailing services throughout Los Angeles and Orange County. Call 562-228-9429 for booking.'
            );
            expect(businessContent.isValuable).toBe(true);
            expect(businessContent.confidence).toBeGreaterThan(0.9);

            const genericContent = baseTemplate.assessTextChunkValue('Lorem ipsum dolor sit amet');
            expect(genericContent.isValuable).toBe(false);
        });
    });

    describe('Metrics and Analytics', () => {
        it('should track metrics correctly', async () => {
            await baseTemplate.generateResponse('test query');
            
            const metrics = baseTemplate.getMetrics();
            expect(metrics.totalQueries).toBe(1);
            expect(metrics.knowledgeEntries).toBeGreaterThan(0);
            expect(metrics.baseTemplateSuccessRate).toBeDefined();
        });

        it('should calculate success rates correctly', async () => {
            // Generate several responses
            await baseTemplate.generateResponse('I want to book service'); // Should succeed
            await baseTemplate.generateResponse('Random unrelated question'); // Should fail
            
            const metrics = baseTemplate.getMetrics();
            expect(metrics.baseTemplateSuccessRate).toContain('%');
        });

        it('should analyze learning patterns', () => {
            const learningData = [
                { query: 'ceramic coating question', response: 'ceramic coating answer', source: 'api1' },
                { query: 'pricing question', response: 'pricing answer', source: 'api1' },
                { query: 'booking question', response: 'booking answer', source: 'api2' }
            ];
            
            const patterns = baseTemplate.analyzeLearningPatterns(learningData);
            expect(patterns.commonTopics).toBeDefined();
            expect(patterns.sources).toBeDefined();
            expect(patterns.totalEvents).toBe(3);
        });
    });

    describe('Backup and Restore', () => {
        it('should export knowledge base', () => {
            const exportData = baseTemplate.exportKnowledgeBase();
            
            expect(exportData.knowledge).toBeDefined();
            expect(exportData.metrics).toBeDefined();
            expect(exportData.version).toBeDefined();
            expect(exportData.exportedAt).toBeDefined();
        });

        it('should import knowledge base', async () => {
            const exportData = baseTemplate.exportKnowledgeBase();
            
            // Clear current knowledge
            baseTemplate.clearKnowledgeBase();
            expect(baseTemplate.knowledgeBase.size).toBe(0);
            
            // Import back
            await baseTemplate.importKnowledgeBase(exportData);
            expect(baseTemplate.knowledgeBase.size).toBeGreaterThan(0);
        });

        it('should clear knowledge base', () => {
            const initialSize = baseTemplate.knowledgeBase.size;
            expect(initialSize).toBeGreaterThan(0);
            
            baseTemplate.clearKnowledgeBase();
            expect(baseTemplate.knowledgeBase.size).toBe(0);
            expect(baseTemplate.conversationMemory.length).toBe(0);
        });
    });
});

describe('ChatWidget Integration', () => {
    let chatWidget;
    let mockAdapters;

    beforeEach(() => {
        // Mock external adapters
        mockAdapters = [
            {
                name: 'TestAdapter',
                sendMessage: vi.fn().mockResolvedValue('Mock external response')
            }
        ];

        chatWidget = new ChatWidget({
            containerId: 'test-chat-widget',
            adapters: mockAdapters,
            enableTrainableTemplate: true,
            trainableTemplateOptions: {
                debug: false,
                confidenceThreshold: 0.7
            }
        });
    });

    afterEach(() => {
        if (chatWidget && chatWidget.baseTemplate) {
            chatWidget.baseTemplate.clearKnowledgeBase();
        }
    });

    describe('Base Template Integration', () => {
        it('should initialize with trainable base template', () => {
            expect(chatWidget.baseTemplate).toBeDefined();
            expect(chatWidget.config.enableTrainableTemplate).toBe(true);
        });

        it('should use base template for high confidence responses', async () => {
            // Add high-confidence knowledge
            await chatWidget.baseTemplate.addKnowledge({
                id: 'test_high_confidence',
                content: 'Jay\'s Mobile Wash offers premium services. Call 562-228-9429.',
                category: 'business_info',
                confidence: 1.0,
                source: 'test',
                tags: ['business', 'contact']
            });

            // Mock DOM elements for testing
            const mockChatMessages = document.createElement('div');
            chatWidget.chatMessages = mockChatMessages;
            
            // Test response generation
            const baseResult = await chatWidget.baseTemplate.generateResponse('business information');
            expect(baseResult.shouldUseExternalAPI).toBe(false);
            expect(baseResult.confidence).toBeGreaterThanOrEqual(0.7);
        });

        it('should fall back to external APIs for low confidence', async () => {
            const baseResult = await chatWidget.baseTemplate.generateResponse('completely unrelated question');
            expect(baseResult.shouldUseExternalAPI).toBe(true);
        });

        it('should learn from external API responses', async () => {
            const userQuery = 'test learning query';
            const externalResponse = 'This is a response from external API that should be learned';
            
            const initialLearningEvents = chatWidget.baseTemplate.metrics.learningEvents;
            
            await chatWidget.baseTemplate.learnFromExternalResponse(userQuery, externalResponse, 'test_api');
            
            expect(chatWidget.baseTemplate.metrics.learningEvents).toBeGreaterThan(initialLearningEvents);
        });
    });

    describe('Training Interface Integration', () => {
        it('should submit training content through widget', async () => {
            const content = 'Test training content for Jay\'s Mobile Wash services';
            
            const result = await chatWidget.submitTrainingContent(content, 'text', {
                source: 'test_training'
            });
            
            expect(result.success).toBe(true);
            expect(result.entriesAdded).toBeGreaterThan(0);
        });

        it('should get learning metrics through widget', () => {
            const metrics = chatWidget.getLearningMetrics();
            
            expect(metrics.totalQueries).toBeDefined();
            expect(metrics.knowledgeEntries).toBeDefined();
            expect(metrics.baseTemplateSuccessRate).toBeDefined();
        });

        it('should export/import knowledge base through widget', async () => {
            const exportData = chatWidget.exportKnowledgeBase();
            expect(exportData.knowledge).toBeDefined();
            
            chatWidget.clearKnowledgeBase();
            expect(chatWidget.baseTemplate.knowledgeBase.size).toBe(0);
            
            await chatWidget.importKnowledgeBase(exportData);
            expect(chatWidget.baseTemplate.knowledgeBase.size).toBeGreaterThan(0);
        });

        it('should get system status including training metrics', () => {
            const status = chatWidget.getSystemStatus();
            
            expect(status.chatWidget).toBeDefined();
            expect(status.baseTemplate).toBeDefined();
            expect(status.baseTemplate.enabled).toBe(true);
            expect(status.baseTemplate.metrics).toBeDefined();
        });
    });
});

describe('Edge Cases and Error Handling', () => {
    let baseTemplate;

    beforeEach(async () => {
        baseTemplate = new TrainableBaseTemplate({
            debug: false,
            confidenceThreshold: 0.7
        });
        await baseTemplate.init();
    });

    afterEach(() => {
        if (baseTemplate) {
            baseTemplate.clearKnowledgeBase();
        }
    });

    it('should handle empty queries gracefully', async () => {
        const response = await baseTemplate.generateResponse('');
        expect(response.shouldUseExternalAPI).toBe(true);
        expect(response.confidence).toBe(0);
    });

    it('should handle invalid training content', async () => {
        const result = await baseTemplate.submitTrainingContent('', 'text', {});
        expect(result.success).toBe(false);
    });

    it('should handle invalid conversation format', async () => {
        try {
            await baseTemplate.submitTrainingContent('invalid json', 'conversation', {});
            expect(true).toBe(false); // Should not reach here
        } catch (error) {
            expect(error.message).toContain('array');
        }
    });

    it('should handle localStorage errors gracefully', () => {
        // Mock localStorage to throw errors
        localStorageMock.setItem.mockImplementation(() => {
            throw new Error('Storage full');
        });

        // Should not crash when saving fails
        expect(() => baseTemplate.saveKnowledgeBase()).not.toThrow();
    });

    it('should handle maximum knowledge entries limit', async () => {
        // Set low limit for testing
        baseTemplate.config.maxKnowledgeEntries = 5;
        
        // Add knowledge entries up to limit
        for (let i = 0; i < 10; i++) {
            await baseTemplate.addKnowledge({
                id: `test_${i}`,
                content: `Test content ${i}`,
                category: 'test',
                confidence: 0.8,
                source: 'test',
                tags: ['test']
            });
        }
        
        // Should handle gracefully without crashing
        expect(baseTemplate.knowledgeBase.size).toBeGreaterThan(0);
    });
});

describe('Performance Tests', () => {
    let baseTemplate;

    beforeEach(async () => {
        baseTemplate = new TrainableBaseTemplate({
            debug: false,
            confidenceThreshold: 0.7
        });
        await baseTemplate.init();
    });

    afterEach(() => {
        if (baseTemplate) {
            baseTemplate.clearKnowledgeBase();
        }
    });

    it('should handle large knowledge base efficiently', async () => {
        const startTime = Date.now();
        
        // Add 100 knowledge entries
        const promises = [];
        for (let i = 0; i < 100; i++) {
            promises.push(baseTemplate.addKnowledge({
                id: `perf_test_${i}`,
                content: `Performance test content ${i} for Jay's Mobile Wash services`,
                category: 'test',
                confidence: 0.8,
                source: 'perf_test',
                tags: ['performance', 'test']
            }));
        }
        
        await Promise.all(promises);
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        expect(baseTemplate.knowledgeBase.size).toBeGreaterThanOrEqual(100);
        expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should search large knowledge base quickly', async () => {
        // Add test knowledge
        for (let i = 0; i < 50; i++) {
            await baseTemplate.addKnowledge({
                id: `search_test_${i}`,
                content: `Search test content ${i} about mobile detailing services`,
                category: 'services',
                confidence: 0.8,
                source: 'search_test',
                tags: ['mobile', 'detailing']
            });
        }
        
        const startTime = Date.now();
        const results = await baseTemplate.searchKnowledgeBase('mobile detailing');
        const endTime = Date.now();
        
        expect(results.length).toBeGreaterThan(0);
        expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should generate responses quickly', async () => {
        // Add knowledge for quick response
        await baseTemplate.addKnowledge({
            id: 'quick_response_test',
            content: 'Quick response test for Jay\'s Mobile Wash booking',
            category: 'booking',
            confidence: 1.0,
            source: 'test',
            tags: ['booking', 'quick']
        });
        
        const startTime = Date.now();
        const response = await baseTemplate.generateResponse('booking service');
        const endTime = Date.now();
        
        expect(response).toBeDefined();
        expect(endTime - startTime).toBeLessThan(500); // Should respond within 500ms
    });
});

// Export test utilities for manual testing
export const testUtils = {
    createTestBaseTemplate: async (options = {}) => {
        const template = new TrainableBaseTemplate({
            debug: true,
            confidenceThreshold: 0.7,
            ...options
        });
        await template.init();
        return template;
    },

    addTestKnowledge: async (template, count = 10) => {
        const promises = [];
        for (let i = 0; i < count; i++) {
            promises.push(template.addKnowledge({
                id: `test_knowledge_${i}`,
                content: `Test knowledge content ${i} for Jay's Mobile Wash`,
                category: 'test',
                confidence: 0.8,
                source: 'test_util',
                tags: ['test', 'utility']
            }));
        }
        return Promise.all(promises);
    },

    testQuery: async (template, query) => {
        return await template.generateResponse(query);
    }
};