import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../bandSettings', () => ({ readSettings: () => ({ backlineStunServers: ['stun:stun.example:3478'] }) }));

import { announce, clientFor, dropHost, hostFor, isPin, join, liveBackline, mayEnter, toClients, toHost } from './liveSession';
import { Mailbox } from './mailbox';

const backline = { instance: 'a', tokenHash: 'hash', public: true, pin: '123456', page: '<p>remote</p>' };
const member = { brontoSession: {} } as App.Locals;
const visitor = { brontoSession: null } as App.Locals;

describe('mailbox', () => {
    it('keeps messages until a later pull confirms them', async () => {
        const box = new Mailbox<string>();
        box.push('one');
        box.push('two');
        expect(await box.pull(0)).toEqual({ next: 2, items: ['one', 'two'] });
        expect(await box.pull(1)).toEqual({ next: 2, items: ['two'] });
    });

    it('answers a waiting pull as soon as a message arrives', async () => {
        const box = new Mailbox<string>();
        const pull = box.pull(0);
        box.push('late');
        expect(await pull).toEqual({ next: 1, items: ['late'] });
    });
});

describe('live session', () => {
    beforeEach(() => dropHost('hash'));

    it('is live once a Backline announces, with the page it sent', () => {
        expect(liveBackline()).toBeNull();
        expect(announce(backline)).toEqual({ next: 0, ice: ['stun:stun.example:3478'] });
        expect(liveBackline()).toEqual({ public: true, page: '<p>remote</p>' });
    });

    it('lets members in, and others only with the PIN when shared publicly', () => {
        expect(mayEnter(member, undefined)).toBe(false); // nothing is live
        announce(backline);
        expect(mayEnter(member, undefined)).toBe(true);
        expect(mayEnter(visitor, '123456')).toBe(true);
        expect(mayEnter(visitor, '000000')).toBe(false);
        announce({ ...backline, public: false });
        expect(mayEnter(visitor, '123456')).toBe(false);
        expect(isPin('')).toBe(false);
    });

    it('passes messages both ways', async () => {
        announce(backline);
        const host = hostFor('a', 'hash');
        const id = join('Anna');
        toHost(id, ['{"t":"hello"}']);
        expect((await host.inbox.pull(0)).items).toEqual([{ c: id, join: 'Anna' }, { c: id, m: '{"t":"hello"}' }]);
        toClients([{ c: id, m: '{"t":"hi"}' }, { c: 'nobody', m: 'lost' }]);
        expect((await clientFor(id).inbox.pull(0)).items).toEqual(['{"t":"hi"}']);
    });

    it('kicks out the previous Backline and its browsers when another announces', () => {
        announce(backline);
        const id = join('Anna');
        announce({ ...backline, instance: 'b' });
        expect(() => hostFor('a', 'hash')).toThrow();
        expect(() => clientFor(id)).toThrow();
        expect(hostFor('b', 'hash').instance).toBe('b');
    });
});
