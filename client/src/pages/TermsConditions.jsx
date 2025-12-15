import React, { useState } from 'react';
import { ShieldCheck, FileText, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

const SECTIONS = [
    {
        title: "Acceptance of Terms",
        content: `These Terms are intended to make you aware of your legal rights and responsibilities with respect to your access to and use of the QuickKart website www.quickkart.com ("Site") and/or any related mobile or software applications (collectively referred to as, "QuickKart Platform") including but not limited to the services offered by QuickKart via the QuickKart Platform or otherwise ("Services").

Your use/ access of the QuickKart Platform shall be governed by these Terms and the Privacy Policy of QuickKart. By accessing the QuickKart Platform and/ or undertaking any sale-purchase transaction, you agree to be bound by the Terms including any additional terms and conditions and policies referenced herein and/or available by hyperlink on the QuickKart Platform and acknowledge that it constitutes an agreement between you and QuickKart.

These Terms may be updated from time to time by QuickKart without notice. It is therefore strongly recommended that you review these Terms each time you access and/or use the QuickKart Platform.`
    },
    {
        title: "Services Overview",
        content: `QuickKart Platform is a platform for users/ consumers to transact with sellers/ service providers offering products/services for sale/ supply through the QuickKart Platform. Products/ services may be listed or offered for sale/ supply on the QuickKart Platform by QuickKart, its affiliates or third parties (“Third Party Sellers”).
        
QuickKart is not and cannot be a party to any transaction between you and the Third Party Sellers, neither does QuickKart have any control or influence over the Third Party Offerings. QuickKart therefore disclaims all warranties and liabilities associated with any Third Party Offerings on the QuickKart Platform.`
    },
    {
        title: "Eligibility",
        content: `Persons who are “incompetent to contract” within the meaning of the Indian Contract Act, 1872 including minors, undischarged insolvent etc. are not eligible to use/access the QuickKart Platform. However, if you are a minor, i.e. under the age of 18 years, you may use/access the QuickKart Platform under the supervision of an adult parent or legal guardian.

QuickKart Platform is intended to be a platform for end-consumers desirous of purchasing product(s)/availing services for domestic / self-consumption. If you are a retailer, institution, wholesaler or any other business to business user, you are not eligible to use the QuickKart Platform.`
    },
    {
        title: "Account & Registration Obligations",
        content: `All users must register and log in for placing orders on the QuickKart Platform. You must keep your account and registration details current and correct for all communications related to your purchases. By agreeing to the Terms, you agree to receive promotional, transactional or other communications from QuickKart.

When you access and use the QuickKart Platform, QuickKart may collect your personally identifiable information, including but not limited to name, email address, age, address, mobile phone number, and other contact details. Personal data so collected will be subject to QuickKart’s Privacy Policy.`
    },
    {
        title: "Limited License & Access",
        content: `Subject to the provisions set out in these Terms, QuickKart grants you a personal, limited, non-exclusive, non-transferable and revocable license to access (for personal use only) the QuickKart Platform and avail the Services. You shall not download or modify any portion thereof, except with express prior written consent of QuickKart.
        
You hereby agree and undertake not to use, host, display, upload, modify, publish, transmit, update or share any information which belongs to another person, is harmful, threatening, abusive, or otherwise unlawful.`
    },
    {
        title: "Advertising",
        content: `Part of the website may contain advertising information or promotional material or other material submitted to QuickKart by third parties. Responsibility for ensuring that material submitted for inclusion on the QuickKart Platform complies with applicable international and national law is exclusively on the party providing the information/material.`
    },
    {
        title: "Disclaimers",
        content: `You acknowledge and agree that the QuickKart Platform and the Services are provided "as is" and "as available" and that your use of the QuickKart Platform and the Services shall be at your sole risk. QuickKart Parties disclaim all warranties, express or implied, in connection with the QuickKart Platform and the Services and your use of them.`
    },
    {
        title: "Delivery Partners",
        content: `We facilitate delivery of orders placed on the QuickKart Platform through independent contractors, i.e. delivery partners, on a principal-to-principal basis. The delivery partners are neither employees nor agents of QuickKart.`
    },
    {
        title: "Customer Comments, Reviews, Ratings",
        content: `All Comments shared, disclosed, submitted, published or offered on the QuickKart Platform shall be and remain the property of QuickKart. You grants the QuickKart Parties a perpetual, irrevocable, world-wide, non-exclusive, fully paid and royalty-free, assignable, sub-licensable and transferable license and right to use/ publish/ display the Comments.`
    },
    {
        title: "Intellectual Property",
        content: `QuickKart expressly reserves all intellectual property rights in all text, programs, products, processes, technology, images, content and other materials which appear on the QuickKart Platform. Access to or use of the QuickKart Platform does not confer and should not be considered as conferring upon anyone any license to any Intellectual Property.`
    },
    {
        title: "Return & Refunds",
        content: `Products once delivered/ services once fulfilled are non-returnable/ non-replaceable/ non-exchangeable/ non-refundable, save and except if the product is damaged, defective, expired at the time of delivery or incorrectly delivered.

All refunds for permitted returns and permitted cancellations will be processed within 7 working days from the date of return/ cancellation approval. Refunds shall be processed in the same manner as they are received or provided in the form of credit/ cashback.`
    },
    {
        title: "Termination",
        content: `QuickKart, in its sole discretion and without liability, reserves the right to terminate or refuse your registration, terminate your use of the QuickKart Platform/ Services and/ or refuse to permit/ restrict your usage/access to the QuickKart Platform/ Services, without notice, with or without cause.`
    },
    {
        title: "Governing Law & Jurisdiction",
        content: `These Terms shall be governed by and construed in accordance with the laws of India. Courts at New Delhi shall have exclusive jurisdiction over any proceedings arising in respect of these Terms.`
    },
    {
        title: "Grievance Redressal",
        content: `For any order related issue, you may first reach out to us via chat support.
        
Details of the Grievance Officer:
Grievance Officer
QuickKart Private Limited
Email: grievance.officer@quickkart.com
Time: Monday - Friday (09:00 hours to 18:00 hours)`
    }
];

const TermsConditions = () => {
    const [openSection, setOpenSection] = useState(null);

    const toggleSection = (index) => {
        setOpenSection(openSection === index ? null : index);
    };

    return (
        <div className="min-h-screen pt-32 pb-20 bg-gray-50/50">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <span className="inline-block px-3 py-1 bg-green-100 text-primary text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                        Legal
                    </span>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
                        Terms & <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#2E7D32]">Conditions</span>
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                        Please read these terms carefully before using our service.
                        <br />
                        <span className="text-sm opacity-60">Last updated: June 2025</span>
                    </p>
                </div>

                <div className="max-w-4xl mx-auto bg-white rounded-[2rem] p-6 md:p-12 shadow-sm border border-gray-100">

                    {/* Introduction Banner */}
                    <div className="bg-green-50 p-6 rounded-2xl mb-10 border border-green-100">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-white rounded-xl text-primary shadow-sm shrink-0">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">Company Information</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    "QuickKart Private Limited" is a company incorporated under the Companies Act, 2013 with its registered office at [Registered Address Placeholder] (hereinafter referred as “We”/ “QuickKart”/ “Us”/ “Our”).
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {SECTIONS.map((section, index) => (
                            <div
                                key={index}
                                className={`border border-gray-100 rounded-2xl transition-all duration-300 ${openSection === index ? 'bg-white shadow-md border-primary/20' : 'bg-gray-50/50 hover:bg-white hover:shadow-sm'}`}
                            >
                                <button
                                    onClick={() => toggleSection(index)}
                                    className="w-full flex items-center justify-between p-6 text-left"
                                >
                                    <h2 className={`font-bold text-lg transition-colors ${openSection === index ? 'text-primary' : 'text-gray-900'}`}>
                                        {index + 1}. {section.title}
                                    </h2>
                                    <div className={`p-2 rounded-full transition-all ${openSection === index ? 'bg-primary text-white rotate-180' : 'bg-gray-200 text-gray-500'}`}>
                                        <ChevronDown size={20} />
                                    </div>
                                </button>

                                <div
                                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${openSection === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                                >
                                    <div className="overflow-hidden">
                                        <div className="px-6 pb-6 pt-0">
                                            <div className="h-px bg-gray-100 mb-6"></div>
                                            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                                                {section.content}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-100 text-center">
                        <p className="text-gray-500 mb-4">Have specific questions?</p>
                        <a
                            href="mailto:support@quickkart.com"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-primary transition-all duration-300 shadow-lg hover:shadow-green-200"
                        >
                            <HelpCircle size={18} />
                            Contact Support
                        </a>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TermsConditions;
