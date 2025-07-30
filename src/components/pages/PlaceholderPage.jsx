import React from 'react';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import ApperIcon from '@/components/ApperIcon';

const PlaceholderPage = ({ 
  title, 
  description, 
  icon, 
  comingSoonFeatures = [],
  gradient = "from-primary-500 to-secondary-600" 
}) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className={`inline-flex p-6 rounded-full bg-gradient-to-br ${gradient} mb-6 shadow-xl`}>
          <ApperIcon name={icon} className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-4xl font-bold gradient-text mb-4 font-display">{title}</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">{description}</p>
      </div>

      {/* Coming Soon Features */}
      {comingSoonFeatures.length > 0 && (
        <Card className="p-8 text-center bg-gradient-to-br from-gray-50 to-white">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 font-display">Coming Soon Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comingSoonFeatures.map((feature, index) => (
              <div key={index} className="p-6 bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                <div className="p-3 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg mb-4 w-fit mx-auto">
                  <ApperIcon name={feature.icon} className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-8">
            <Button variant="primary" size="lg" className="mx-auto">
              <ApperIcon name="Bell" className="w-5 h-5 mr-2" />
              Get Notified When Available
            </Button>
          </div>
        </Card>
      )}

      {/* Call to Action */}
      <Card className="p-8 text-center bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 font-display">Need This Feature Prioritized?</h3>
        <p className="text-gray-600 mb-6">Let us know which features matter most to your school's workflow.</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="primary">
            <ApperIcon name="MessageSquare" className="w-4 h-4 mr-2" />
            Contact Support
          </Button>
          <Button variant="outline">
            <ApperIcon name="ArrowLeft" className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PlaceholderPage;