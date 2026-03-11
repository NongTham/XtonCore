import { PaginationBuilder } from '../../src/utils/PaginationBuilder';
import { EmbedBuilder, ComponentType, ActionRowBuilder, ButtonBuilder } from 'discord.js';

// Mock logger
jest.mock('../../src/logger', () => ({
  Clientlogger: {
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('PaginationBuilder', () => {
  let interactionMock: any;
  let builder: PaginationBuilder;

  beforeEach(() => {
    interactionMock = {
      user: { id: 'user1' },
      reply: jest.fn(),
      editReply: jest.fn().mockResolvedValue({}),
    };

    builder = new PaginationBuilder(interactionMock, 5000);
  });

  it('should throw error if rendered with no embeds', async () => {
    await expect(builder.render()).rejects.toThrow('No embeds to paginate');
  });

  it('should send a single message without buttons if only 1 embed', async () => {
    const embed = new EmbedBuilder().setTitle('Page 1');
    builder.setEmbeds([embed]);

    const mockMessage = { id: 'msg1' };
    interactionMock.reply.mockResolvedValueOnce(mockMessage);

    const result = await builder.render();

    expect(result).toBe(mockMessage);
    expect(interactionMock.reply).toHaveBeenCalledWith(expect.objectContaining({
      embeds: [embed],
      ephemeral: false
    }));
  });

  it('should generate buttons and footer for multiple embeds', async () => {
    const embed1 = new EmbedBuilder().setTitle('Page 1');
    const embed2 = new EmbedBuilder().setTitle('Page 2');

    builder.setEmbeds([embed1, embed2]);

    const mockCollector = {
      on: jest.fn(),
    };

    const mockMessage = {
      id: 'msg1',
      createMessageComponentCollector: jest.fn().mockReturnValue(mockCollector)
    };

    interactionMock.reply.mockResolvedValueOnce(mockMessage);

    await builder.render();

    // Check reply args
    expect(interactionMock.reply).toHaveBeenCalled();
    const replyArgs = interactionMock.reply.mock.calls[0][0];

    // Should have 1 row of components
    expect(replyArgs.components).toBeDefined();
    expect(replyArgs.components.length).toBe(1);

    // Embed1 should have footer updated to Page 1 of 2
    expect(embed1.data.footer?.text).toBe('Page 1 of 2');
    expect(embed2.data.footer?.text).toBe('Page 2 of 2');
  });

  it('should handle navigation buttons correctly', async () => {
    const embed1 = new EmbedBuilder().setTitle('P1');
    const embed2 = new EmbedBuilder().setTitle('P2');
    const embed3 = new EmbedBuilder().setTitle('P3');

    builder.setEmbeds([embed1, embed2, embed3]);

    let collectCallback: any;
    const mockCollector = {
      on: jest.fn().mockImplementation((event, cb) => {
        if (event === 'collect') collectCallback = cb;
      }),
    };

    interactionMock.reply.mockResolvedValueOnce({
      createMessageComponentCollector: () => mockCollector
    });

    await builder.render();

    // Simulate next page click
    const nextInteraction = {
      user: { id: 'user1' },
      customId: 'next_page',
      deferUpdate: jest.fn().mockResolvedValueOnce(true),
      reply: jest.fn()
    };

    await collectCallback(nextInteraction);

    expect(nextInteraction.deferUpdate).toHaveBeenCalled();
    expect(interactionMock.editReply).toHaveBeenCalledWith(expect.objectContaining({
      embeds: [embed2]
    }));

    // Simulate prev page click
    const prevInteraction = {
      user: { id: 'user1' },
      customId: 'prev_page',
      deferUpdate: jest.fn().mockResolvedValueOnce(true),
      reply: jest.fn()
    };

    await collectCallback(prevInteraction);
    expect(interactionMock.editReply).toHaveBeenCalledWith(expect.objectContaining({
      embeds: [embed1]
    }));
  });

  it('should prevent other users from paginating', async () => {
    builder.setEmbeds([new EmbedBuilder().setTitle('P1'), new EmbedBuilder().setTitle('P2')]);

    let collectCallback: any;
    interactionMock.reply.mockResolvedValueOnce({
      createMessageComponentCollector: () => ({
        on: (event: string, cb: any) => { if (event === 'collect') collectCallback = cb; }
      })
    });

    await builder.render();

    const badUserInteraction = {
      user: { id: 'hacker' },
      customId: 'next_page',
      reply: jest.fn(),
      deferUpdate: jest.fn()
    };

    await collectCallback(badUserInteraction);

    expect(badUserInteraction.deferUpdate).not.toHaveBeenCalled();
    expect(badUserInteraction.reply).toHaveBeenCalledWith({
      content: 'You cannot use these buttons.',
      ephemeral: true
    });
  });

  it('should disable components on timeout', async () => {
    builder.setEmbeds([new EmbedBuilder().setTitle('P1'), new EmbedBuilder().setTitle('P2')]);

    let endCallback: any;
    interactionMock.reply.mockResolvedValueOnce({
      createMessageComponentCollector: () => ({
        on: (event: string, cb: any) => { if (event === 'end') endCallback = cb; }
      })
    });

    await builder.render();

    // Simulate collector end
    await endCallback();

    // Should edit reply to disable components
    expect(interactionMock.editReply).toHaveBeenCalled();
    const editArgs = interactionMock.editReply.mock.calls[0][0];

    // The action row is a builder here, so we extract components and check if they are disabled
    const firstRow: ActionRowBuilder<ButtonBuilder> = editArgs.components[0];
    const buttons = firstRow.components;
    expect(buttons[0].data.disabled).toBe(true);
    expect(buttons[1].data.disabled).toBe(true);
  });
});
